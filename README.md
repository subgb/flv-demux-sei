# flv-demux-sei

## 0. Required
> node v6- (depened on buffer-v6-pollify)

## 1. Support Format
1. Video: only AVC
2. Audio: only AAC

## 2. Installation
```bash
npm install flv-demux-sei
```

## 3. Run Test
> cd test && node index.js

## 4. How To Use It
```javascript
    const FlvDemux = require('flv-demux-sei');
    let decoder = new FlvDemux.Decoder();

    decoder.on('header', header => {
        // get flv header info
    });

    decoder.on('tag', tag => {
        switch(tag.type){
            case FlvDemux.DataTag.TYPE:
            // get onMetaData info
            break;
            case FlvDemux.AudioTag.TYPE:
            // get audio info
            break;
            case FlvDemux.VideoTag.TYPE:
            // get video info
            break;
        }
    });

    // you can decode buffer again
    decoder.decode(buffer);

    setTimeout(()=>{
        decoder.destroy();
    }, 5000);
```

```javascript
    const fs = require('fs');
    const FlvDemux = require('flv-demux-sei');
    const decoder = new FlvDemux.Decoder();

    decoder.on('audio-tag', tag => {
        // get audio info
    });
    decoder.on('video-tag', tag => {
        // get video info
    });
    decoder.on('sei-data', (sei, tag) => {
        if (sei.payloadType == 5) doSomething(sei.payload);
    });

    const stream = fs.createReadStream('./path/to/my-video.flv').pipe(decoder);
```
