import {listEvents} from '../src/index'
import "websocket-polyfill"

test("list", async ()=>{
    console.log("test")
    const ev = await listEvents({
        kind: [40],
        relays: ["wss://nos.lol"]
    })

    expect(ev.length).toBeGreaterThan(0)
})

