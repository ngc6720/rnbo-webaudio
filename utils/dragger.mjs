class Dragger {

  #el;
  #previousTouch;

  constructor(el, startEl = el) {
    this.#el = el;
    
    this.down = loc => {};
    this.drag = loc => {};
    this.up = loc => {};

    startEl.ontouchstart = (e) => (this.#handleEvents(e), e.preventDefault());
    startEl.onmousedown = (e) => (this.#handleEvents(e), e.preventDefault());
  }

  #handleEvents(e) {
    let ev2, ev3;
    e.type === 'touchstart' && (ev2 = 'touchmove', ev3 = 'touchend');
    e.type === 'mousedown' && (ev2 = 'mousemove', ev3 = 'mouseup');

    const cb1 = (e) => {
      this.down(this.#getLoc(e));
    };
    const cb2 = (e) => {
      this.drag(this.#getLoc(e));
    };
    const cb3 = (e) => {
      this.up(this.#getLoc(e));
      document.removeEventListener(ev2, cb2);
      document.removeEventListener(ev3, cb3);
    }
  
    cb1(e);
    document.addEventListener(ev2, cb2);
    document.addEventListener(ev3, cb3);
  }

  #getLoc(e) {
    let type, rect, width, height, x, y, normX, normY, mX, mY;
    type = e.type;
    rect = this.#el.getBoundingClientRect();
    width = rect.right - rect.left;
    height = rect.bottom - rect.top;
    mX = e.movementX ?? 0;
    mY = e.movementY ?? 0;
    
    if (type === "touchstart" || type === "touchmove") {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    }
    if (type === "touchmove") {
      if (this.#previousTouch) {
        mX = x - this.#previousTouch[0];
        mY = y - this.#previousTouch[1];
      }
      this.#previousTouch = [x, y];
    }
    if (type === "touchend") {
      x = e.changedTouches[0].clientX - rect.left;
      y = e.changedTouches[0].clientY - rect.top;
    } 
    if (type === "mousedown" || type === "mousemove" || type === "mouseup") { 
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    if (type === "touchend" || type === "mouseup") {
      mX = 0;
      mY = 0;
      this.#previousTouch = null;
    }

    x > width && (x = width);
    x < 0 && (x = 0);
    y > height && (y = height);
    y < 0 && (y = 0);

    normX = x / width;
    normY = y / height;
    
    return { width, height, x, y, normX, normY, mX, mY }
  }

}

export default Dragger;