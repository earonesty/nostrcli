# nostrcli


Very simple low-level nostr command line client, useful for debugging

## Usage:

```
Usage: nostrcli [options]

Options:
  -V, --version            output the version number
  --set-private <value>    save private key to ~/.config/nostrcli
  --add-relay <values...>  save relay to ~/.config/nostrcli
  --del-relay <values...>  remove relay from ~/.config/nostrcli
  -d, --debug              debug
  -c, --config <value>     use config (default: "~/.config/nostrcli")
  -l, --list               list events
  -p, --publish            publish event
  -k, --kind <number...>   kind (default: [1])
  -a, --author <value...>  one or more author keys to filer
  -t, --tag <values...>    one or more key:value[,value...] tags
  -c, --content <value>    content for publishing
  -h, --help               display help for command
```

## Examples of use:

List chat channels:

`nostrcli -l -k 40`

List kind 4 messages authored by X and sent to Y:

`nostrcli -l -k 4 -a f449b4c70fe81b0181305e925bf2932f82a0c2dc71ea9e12aaec83e6236b7fa5  -t p:0be0117bebe9044719fee4d21e67d22834370cb8d7164ebc72ae870207d64c4f`
