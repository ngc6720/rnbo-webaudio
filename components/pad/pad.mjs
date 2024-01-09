/**
 * A draggable pad that updates with cb functions provided with its "register" method
 */

import Dragger from '../../utils/dragger.mjs'

class Pad extends HTMLElement {
      
    #listeners = { 'x': [], 'y': [], 'down': [], 'up': [], 'mov': [] };

    #el = document.createElement('div');
    #plane = document.createElement('div');
    #handle = document.createElement('div');
    #drag = new Dragger(this.#plane, this.#el)

    static get observedAttributes() {
        return ['disabled'];
    }

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: "open" });

        this.#el.setAttribute('class', 'pad');
        this.#plane.setAttribute('class', 'plane');
        this.#handle.setAttribute('class', 'handle');

        const style = document.createElement("style");
        style.textContent = `@import 'components/pad/pad.css'`;
        shadow.appendChild(style);

        this.#plane.appendChild(this.#handle)
        this.#el.appendChild(this.#plane)
        shadow.appendChild(this.#el);
    }

    connectedCallback() {
        this.setAttribute('disabled', true);
        
        this.#drag.down = loc => {
            this.#listeners['x'].forEach(listener => listener.cb(loc.normX))
            this.#listeners['y'].forEach(listener => listener.cb(1 - (loc.normY)))
            this.#listeners['down'].forEach(listener => listener.cb())
            this.#el.classList.add('active')
            this.#renderEl(loc.normX, loc.normY);
        }
        this.#drag.drag = loc => {
            this.#listeners['mov'].forEach(listener => listener.cb(Math.min(1, Math.max(0, (Math.abs(loc.mX) + Math.abs(loc.mX)) * 0.5 * 0.01))))
            this.#listeners['x'].forEach(listener => listener.cb(loc.normX))
            this.#listeners['y'].forEach(listener => listener.cb(1 - (loc.normY)))
            this.#renderEl(loc.normX, loc.normY)
        }
        this.#drag.up = () => {
            this.#listeners['up'].forEach(listener => listener.cb())
            this.#el.classList.remove('active')
        }
    }

    disconnectedCallback() {
        this.#removeListeners();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'disabled') {
            if (newValue === 'true') {
                this.#el.classList.add('disabled');
            } else {
                this.#el.classList.remove('disabled');
            }
        }
    }

    register(type, cb) {
        this.#listeners[type].push({ type: type, cb: cb });
        if (this.getAttribute('disabled') === 'true') this.setAttribute('disabled', false);
    }

    deregisterAll() {
        this.#removeListeners();
        this.setAttribute('disabled', true);
        this.#renderEl(0.5, 0.5)
    }

    #removeListeners() {
        this.#listeners = { 'x': [], 'y': [], 'down': [], 'up': [], 'mov': []};
    }


    #renderEl(normX, normY) {
        this.#el.style.setProperty('--posX', normX);
        this.#el.style.setProperty('--posY', normY);
        this.#el.style.setProperty('--rotationY', `${(normX - 0.5) * -24}deg`);
        this.#el.style.setProperty('--rotationX', `${(normY - 0.5) * 24}deg`);
    }

}

customElements.define('my-pad', Pad);