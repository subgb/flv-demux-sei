const EventEmitter = require('events').EventEmitter;
const Tag = require('./Tag');

module.exports = class Body extends EventEmitter {
  static get MIN_LENGTH() {
    return 4;
  }

  static get STATE() {
    return 'body';
  }

  constructor() {
    super();
    this.config = {
      naluLengthSize: 4,
    };
  }

  decode(buffer, size = 0) {
    for (;;) {
      if (buffer.length < Body.MIN_LENGTH) {
        break;
      }

      let tagSize = buffer.readUInt32BE(0);
      let body = buffer.slice(4);
      if (body.length < Tag.MIN_LENGTH) {
        return {
          data: buffer,
          success: false
        };
      }

      let tag = new Tag();
      body = tag.decode(body, 0, this.config);
      if (!body) {
        return {
          data: buffer,
          success: false
        };
      }

      let data = tag.toJSON();
      let tagSizeBuffer = Buffer.alloc(4);
      tagSizeBuffer.writeUInt32BE(tagSize);
      data.tagSizeBuffer = tagSizeBuffer;
      this.emit('tag', data);
      buffer = body;
    }

    return {
      data: buffer,
      success: true
    };
  }
};
