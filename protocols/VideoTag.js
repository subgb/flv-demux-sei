module.exports = class VideoTag {
  static get MIN_LENGTH() {
    return 0;
  }

  static get TYPE() {
    return 9;
  }

  constructor() {
    this.frameType = 0x01;
    this.codecId = 0x01;
    this.AVCPacketType = 0x01;
    this.compositionTime = 0x00;
    this.data = Buffer.alloc(0);
    this.originBuffer = Buffer.alloc(0);
    this.seiData = [];
  }

  decode(buffer, size, config = {naluLengthSize:4}) {
    this.frameType = (buffer.readUInt8(0) & 240) >> 4;
    this.codecId = buffer.readUInt8(0) & 15;
    if (this.codecId != 7) {
      throw new Error('not support this video type(only AVC support)');
    }

    this.AVCPacketType = buffer.readUInt8(1);
    this.compositionTime = buffer.readInt32BE(2) >> 8;
    this.data = buffer.slice(5, size);
    this.originBuffer = buffer.slice(0, size);

    if (1 === this.AVCPacketType) {
      this.parseAVCVideoSEI(this.data, config);
    }
    else if (0 === this.AVCPacketType) {
      const nlenSize = config.naluLengthSize = (buffer.readUInt8(9) & 3) + 1;
      if (nlenSize !== 3 && nlenSize !== 4) {
        throw new Error(`strange NaluLengthSize: ${nlenSize}`);
      }
    }

    return buffer.slice(size);
  }

  toJSON() {
    return {
      frameType: this.frameType,
      codecId: this.codecId,
      AVCPacketType: this.AVCPacketType,
      compositionTime: this.compositionTime,
      data: this.data,
      seiData: this.seiData,
    };
  }

  parseAVCVideoSEI(buffer, config) {
    const nlenSize = config.naluLengthSize;
    const list = [];
    let offset = 0;
    while (buffer.length > offset) {
      if (offset + 4 >= buffer.size) {
        throw new Error(`Malformed Nalu: size ${buffer.size}, offset ${offset}`);
      }
      let naluSize = buffer.readUInt32BE(offset);
      if (3 === nlenSize) naluSize >>>= 8;
      if (naluSize + nlenSize > buffer.size) {
        throw new Error(`Malformed Nalus: NalunLenSize > DataSize!`);
      }
      const unitType = buffer.readUInt8(offset + nlenSize) & 0x1F;
      if (6 === unitType) {
        const nalu = buffer.slice(offset, offset + nlenSize + naluSize);
        this.parseSEIData(nalu);
      }
      offset += nlenSize + naluSize;
    }
  }

  parseSEIData(nalu, offset=5) {
    if (nalu.length < 13) return null;
    const payloadType = readvalue(nalu)
    const payloadSize = readvalue(nalu)
    if (10 > payloadSize || offset+payloadSize+1 > nalu.byteLength) return null;
    const payload = nalu.slice(offset, offset+payloadSize);
    const sei = {
      payloadType,
      payloadSize,
      payload,
      originPayload: payload,
    };
    this.seiData.push(sei);
    if(payloadType == 5) {
      const src = payload;
      const dst = Buffer.alloc(payloadSize);
      let m=0, n=0;
      while (m < payloadSize) {
        if (m+3<payloadSize && 0==src[m] && 0==src[m+1] && 3==src[m+2] && src[m+3]<=3) {
          dst[n++] = src[m];
          dst[n++] = src[m+1];
          m += 3
        }
        else {
          dst[n++] = src[m++];
        }
      }
      sei.payload = dst.slice(0, n);
    }
    function readvalue() {
      let value = nalu[offset++];
      while (offset < nalu.byteLength && 0xff === nalu[offset-1]) {
        value += nalu[offset++];
      }
      return value;
    }
  }
};
