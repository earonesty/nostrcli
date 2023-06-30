#! /usr/bin/env node

import * as fs from 'fs';
import * as os from 'os';
import "websocket-polyfill"
import { Filter, SimplePool } from 'nostr-tools'
const { Command } = require("commander");

const program = new Command();

interface Config {
  relays?: string[],
  private?: string
}

interface Opts extends Config {
  debug?: boolean,
  list?: boolean,
  limit?: number,
  publish?: boolean,
  kind: number[],
  tags?: string[][],
  content?: string
}

async function main() {
  program
    .version("1.0.0")
    .description("nostr cli")
    .option("--set-private <value>", "save private key to ~/.config/nostrcli")
    .option("--add-relay <values...>", "save relay to ~/.config/nostrcli")
    .option("--del-relay <values...>", "remove relay from ~/.config/nostrcli")
    .option("-d, --debug", "debug")
    .option("-c, --config <value>", "use config", "~/.config/nostrcli")
    .option("-l, --list", "list events")
    .option("-n, --limit <number>", "limit")
    .option("-p, --publish", "publish event")
    .option("-k, --kind <number...>", "kind", [1])
    .option("-a, --author <value...>", "one or more author keys to filer")
    .option("-t, --tag <values...>", "one or more key:value[,value...] tags")
    .option("-c, --content <value>", "content for publishing")
    .parse(process.argv);

    const opts = program.opts();

    if (opts.config[0] == "~") {
      opts.config = os.homedir() + opts.config.slice(1)
    }

    let cfg: Config = {}
    try {
      cfg = JSON.parse(fs.readFileSync(opts.config, {"encoding": 'utf-8'}));
    } catch (e: any) {
       if (e.code !== 'ENOENT')
          console.warn(`# error reading config: ${e}`)
       else
          console.warn(`# no ${opts.config} file, please use --add-relay at least once`)
       process.exit(1)
    }
    
    Object.assign(opts, cfg)

    if (opts.addRelay) {
        if (!cfg.relays) cfg.relays = []
        cfg.relays = Array.from(new Set(cfg.relays.concat(opts.addRelay)))
        fs.writeFileSync(opts.config, JSON.stringify(cfg))
    }

    if (opts.delRelay) {
        if (!cfg.relays) cfg.relays = []
        cfg.relays = cfg.relays.filter(rel=>!(rel in opts.delRelay))
        fs.writeFileSync(opts.config, JSON.stringify(cfg))
    }

    if (opts.setPrivate) {
        cfg.private = opts.setPrivate
        fs.writeFileSync(opts.config, JSON.stringify(cfg))
    }

    opts.tags = []
    if (opts.tag) {
      const tags: string[][] = []
      for (const t of opts.tag) {
        const kv = t.split(":", 2)
        let fin: string[]
        if (kv[1]) {
          fin = [kv[0]].concat(kv[1].split(","))
        } else {
          fin = kv[0].split(",")
        }
        tags.push(fin)
      }
      opts.tags = tags
      delete opts["tag"]
    }

    if (opts.kind) {
        opts.kind = opts.kind.map((k:string)=>parseInt(k))
    }
    
    if (opts.limit) {
        opts.limit = parseInt(opts.limit)
    }
  
    if (opts.debug) console.warn("options", opts)

    if (opts.publish) {
        console.warn("publish")
    }
    
    if (opts.list) {
        await listEvents(opts)
    }
}

export async function listEvents(opts: Opts) {
  const since = ~~(Date.now() / 1000) - (86400 * 7)
  if (!opts.relays)
    throw Error("no relays speciied, use --add-relay")
  
  const pool = new SimplePool()

  try {
      const f: Filter<number> = {}
      f.kinds = opts.kind
      f.authors = opts.author
     
      if (opts.limit)
          f.limit = opts.limit

      if (!opts.tags)
        opts.tags = []
      
      for (const tag of opts.tags) {
        if (tag[0] == "p") {
          if (!f["#p"]) f["#p"] = []
          f["#p"] = f["#p"].concat(tag[1])
        }
        if (tag[0] == "d") {
          if (!f["#d"]) f["#d"] = []
          f["#d"] = f["#d"].concat(tag[1])
        }
      }
      
      f.since = since
      if (opts.debug) console.warn("filter", f, "relays", opts.relays)
      const res = await pool.list(opts.relays, [f])
      process.stdout.write(JSON.stringify(res, null, 2))
      return res
  } finally {
    pool.close(opts.relays)
  }
}

if (require.main === module)
  main()
