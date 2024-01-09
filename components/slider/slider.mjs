/**
 * An input type range wrapper that can connect to RNBO parameters and inlets
 */

class Slider extends HTMLElement {
      
    #listeners = [];
    #el = document.createElement('div');
    
    #clip = (v, [min, max]) => Math.max(min, Math.min(max, v));
    
    input = document.createElement('input');
    label = document.createElement('label');

    static get observedAttributes() {
        return ['disabled'];
    }

    constructor() {
        super();
        const shadow = this.attachShadow({ mode: "open" });

        this.#el.setAttribute('class', 'slider');
        this.input.setAttribute('type', 'range');

        const style = document.createElement("style");
        style.textContent = `@import 'components/slider/slider.css'`;
        shadow.appendChild(style);

        shadow.appendChild(this.#el);
        this.#el.appendChild(this.input);
        this.#el.appendChild(this.label);
    }

    connectedCallback() {
        this.setAttribute('disabled', true);
    }

    addListener(target, event, callback) {
        target.addEventListener(event, callback);
        this.#listeners.push([ target, event, callback ]);
    }

    #removeListeners() {
        this.#listeners.forEach(listener =>
            listener[0].removeEventListener(listener[1], listener[2], false)
        );
        this.#listeners = [];
    }

    disconnectedCallback() {
        this.#removeListeners();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'disabled') {
            if (newValue === 'true') {
                this.#el.classList.add('disabled');
                this.input.setAttribute('disabled', true);
            } else {
                this.#el.classList.remove('disabled');
                this.input.removeAttribute('disabled')
            }
        }
    }

    attach({
        id,
        name,
        range = [ 0, 1 ],
        step = 0.001,
        initialValue = range[0],
        cb
    } = {}) {
        id && this.input.setAttribute('id', id);
        id && this.setAttribute('id', id);
        this.input.setAttribute('min', range[0]);
        this.input.setAttribute('max', range[1]);
        name && this.input.setAttribute('name', name);
        name && (this.label.textContent = name);
        this.input.setAttribute('step', step);
        this.input.value = initialValue;
        if (cb) {
            cb(device, inputId,  value)
            this.addListener(this.input, 'change', e => cb(this.#clip(+e.target.value), range))
        }
        this.setAttribute('disabled', false);
    }

    attachParam({ param, name, range, step = 0.001, cb } = {}) {
        this.attach({
            id: param.id,
            name: name,
            range: range ?? [ param.min, param.max ],
            step: step,
            initialValue: param.value
        })
        this.addListener(this.input, 'change', e => cb(param, this.#clip(+e.target.value, [param.min, param.max])))
      }

    attachInlet({ inputId, name, range = [0, 1], initialValue = range[0], step = 0.01, cb } = {}) {
        this.attach({
            id: inputId,
            name: name,
            range: range,
            step: step,
            initialValue: initialValue,
        })
        cb(inputId,  this.input.value)
        this.addListener(this.input, 'change', e => cb(inputId,  this.#clip(+e.target.value, range))) //reecrire
    }

    detach() {
        this.#removeListeners();
        this.setAttribute('id', '');
        this.input.setAttribute('id', '');
        this.input.setAttribute('min', 0);
        this.input.setAttribute('max', 1);
        this.input.setAttribute('name', '');
        this.label.textContent = '';
        this.input.setAttribute('step', 0.001);
        this.input.value = 0.5;
        this.setAttribute('disabled', true);
    }

    setValueNotifying(normalisedVal) {
        const [ min, max ] = [ +this.input.min, +this.input.max ];
        this.input.value = normalisedVal * (max - min) + min;
        this.input.dispatchEvent(new Event('change'));
    }
}

customElements.define('my-slider', Slider);