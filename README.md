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
