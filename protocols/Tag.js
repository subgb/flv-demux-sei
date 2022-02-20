const AudioTag = require('./AudioTag');
const VideoTag = require('./VideoTag');
const DataTag = require('./DataTag');

module.exports = class Tag {
  static get MIN_LENGTH() {
    return 11;
  }

  constructor() {
    this.type = 0x00;
    this.size = 0x00;
    this.timestamp = 0x00;
    this.streamId = 0x00;
    this.data = null;
    this.prevBuffer = Buffer.alloc(0);
  }

  decode(buffer, size = 0, config) {
    this.type = buffer.readUInt8(0);
    this.size = buffer.readUInt24BE(1);

    let ts0 = buffer.readUInt24BE(4);
    let ts1 = buffer.readUInt8(7);
    this.timestamp = (ts1 << 24) | ts0;

    this.streamId = buffer.readUInt24BE(8) >> 8;
    this.prevBuffer = buffer.slice(0, 11);
    if (this.streamId != 0) {
      throw new Error(`stream id must be 0, get(${this.streamId})`);
    }

    if (buffer.length < Tag.MIN_LENGTH + this.size) {
      return false;
    }

    switch (this.type) {
      case AudioTag.TYPE:
        this.data = new AudioTag();
        break;
      case VideoTag.TYPE:
        this.data = new VideoTag();
        break;
      case DataTag.TYPE:
        this.data = new DataTag();
        break;
      default:
        throw new Error(`not support tag type(${this.type})`);
    }

    buffer = buffer.slice(Tag.MIN_LENGTH);
    let body = this.data.decode(buffer, this.size, config);
    return !body ? false : body;
  }

  toJSON() {
    let data = this.data;
    let originBuffer = Buffer.concat([this.prevBuffer, data.originBuffer]);
    data = data && data.toJSON ? data.toJSON() : null;
    return {
      type: this.type,
      size: this.size,
      timestamp: this.timestamp,
      streamId: this.streamId,
      data: data,
      originBuffer: originBuffer
    };
  }
};
