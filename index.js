class Slider {
  constructor({ slider, max_characters, callback }) {
    this.MAX_CHARACTERS = max_characters;
    this.slider = slider;
    this.isDragging = false;
    this.callback = callback;
    this.value = 0;
    this.init();
  }

  mouseDownHandler = (e) => {
    this.isDragging = true;
    this.thumb.classList.add("active");
    this.prevX = e.clientX;
  };

  mouseUpHandler = () => {
    this.isDragging = false;
    this.thumb.classList.remove("active");
  };

  mouseMoveHandler = (e) => {
    let { isDragging, prevX, thumb, left, minLeft, maxLeft, callback } = this;

    if (!isDragging) return;

    const delta = e.clientX - prevX;

    let newLeft = thumb.offsetLeft + delta;

    if (newLeft < minLeft) return;
    if (newLeft > maxLeft) return;

    thumb.style.left = newLeft + "px";

    this.value = Math.round(newLeft / this.step);

    this.prevX = e.clientX;

    left.style.width = newLeft + "px";

    callback(this.value);
  };

  init() {
    this.slider.classList.add("range-slider");

    this.left = document.createElement("div");
    this.left.classList.add("range-track-left");

    this.thumb = document.createElement("div");
    this.thumb.classList.add("range-slider-thumb");

    this.slider.appendChild(this.left);
    this.slider.appendChild(this.thumb);

    this.minLeft = 0;
    this.maxLeft = this.slider.clientWidth - this.thumb.clientWidth;

    this.step = this.slider.clientWidth / this.MAX_CHARACTERS - 1;

    this.thumb.addEventListener("pointerdown", this.mouseDownHandler);
    window.addEventListener("pointerup", this.mouseUpHandler);
    window.addEventListener("pointermove", this.mouseMoveHandler);
  }
}

class PasswordGenerator {
  constructor({ optUCase, optLCase, optNum, optSym, length }) {
    this.optUCase = optUCase;
    this.optLCase = optLCase;
    this.optNum = optNum;
    this.optSym = optSym;
    this.length = length;

    this.lowercase = Array.from({ length: 26 }, (_, i) =>
      String.fromCharCode(97 + i)
    );

    this.uppercase = Array.from({ length: 26 }, (_, i) =>
      String.fromCharCode(65 + i)
    );

    this.digits = Array.from({ length: 10 }, (_, i) =>
      String.fromCharCode(48 + i)
    );

    this.printableSymbols = Array.from({ length: 95 }, (_, i) =>
      String.fromCharCode(32 + i)
    ).filter((ch) => !/[0-9a-zA-Z]/.test(ch));
  }

  passwordRaiting(){
    const strongCriterions = [
      { name: 'too-weak', weightFrom: 0, weightTo: 2 },
      { name: 'weak', weightFrom: 3, weightTo: 4 },
      { name: 'medium', weightFrom: 5, weightTo: 6 },
      { name: 'strong', weightFrom: 7, weightTo: 8 },
    ]; 

    const criterionsLenght = [
      {
        lenghtFrom: 0,
        lenghtTo: 5,
        weight: 0
      },
      {
        lenghtFrom: 6,
        lenghtTo: 8,
        weight: 1
      },
      {
        lenghtFrom: 9,
        lenghtTo: 11,
        weight:2
      },
      {
        lenghtFrom: 12,
        lenghtTo: 15,
        weight:3
      },
      {
        lenghtFrom: 16,
        lenghtTo: Infinity,
        weight: 4
      },
    ];

    const {
      optUCase,
      optLCase,
      optNum,
      optSym,
      length
    } = this;


    const weightLength = criterionsLenght.filter(
      ({ lenghtFrom, lenghtTo }) =>
        length >= lenghtFrom && length <= lenghtTo
    )[0].weight;

    let weightGroup = +optUCase + optLCase + optNum + optSym - 1;

    if (weightGroup < 0) weightGroup = 0
    
    const weighSummary = weightLength + weightGroup;

    return strongCriterions.filter(({weightFrom, weightTo}) => weighSummary >= weightFrom && weighSummary<=weightTo )[0].name

  }

  validatePassword(password) {
     const {
      optUCase,
      optLCase,
      optNum,
      optSym,
      printableSymbols
    } = this;

    if([...password].includes(" ")) return false;

    let pattern = "^";

    if(optUCase) pattern += "(?=.*[A-Z])"
    if(optLCase) pattern += "(?=.*[a-z])"
    if(optNum) pattern += "(?=.*[0-9])"
    if(optSym) pattern += `(?=.*[${printableSymbols.join("")}])`

    pattern += ".+$"

    const regexp = new RegExp(pattern)

    return regexp.test(password)
  }

  generate() {
    const {
      optUCase,
      optLCase,
      optNum,
      optSym,
      length,
      lowercase,
      uppercase,
      digits,
      printableSymbols,
    } = this;
    let dictionary = [];

    if (+optUCase+optLCase+optNum+optSym > length) return "-1";

    if (optUCase) dictionary = [...dictionary, ...uppercase];
    if (optLCase) dictionary = [...dictionary, ...lowercase];
    if (optNum) dictionary = [...dictionary, ...digits];
    if (optSym) dictionary = [...dictionary, ...printableSymbols];

    const dLength = dictionary.length;

    if (length === 0 || dLength === 0) return "";

    let result;
    let validated = false;

    while(!validated){
      result = "";
      for (let i = 1; i <= length; i++) {
        let random = Math.floor(Math.random() * dLength);
        result += dictionary[random];
      }

      validated = this.validatePassword(result);
    }

    return result;
  }
}

function main() {
  const sl = new Slider({
    slider: document.querySelector(".slider"),
    max_characters: 20,
    callback: (value) => {
      const cLength = document.querySelector(".character-length");
      cLength.innerText = value;
    },
  });

  const btnGenerate = document.querySelector(".options button");
  btnGenerate.addEventListener("click", () => {
    const optUCase = document.querySelector("#ucase").checked;
    const optLCase = document.querySelector("#lcase").checked;
    const optNum = document.querySelector("#num").checked;
    const optSym = document.querySelector("#symbol").checked;
    const qualityName = document.querySelector('.quality-name');
    const qualityGraph = document.querySelector(".quality-graph")
    const copied = document.querySelector('.password button div');
    copied.innerText = '';
    
    const length = sl.value;

    const gen = new PasswordGenerator({
      optUCase,
      optLCase,
      optNum,
      optSym,
      length,
    });

    const pwd = document.querySelector(".password input[type=text]");
    pwd.value = gen.generate();

    const passwordRaiting = gen.passwordRaiting();
    
    qualityGraph.classList.remove('too-weak', 'weak', 'medium', 'strong');
    qualityGraph.classList.add(passwordRaiting);
    qualityName.innerText = passwordRaiting;
  });
}

window.addEventListener("load", () => {
  const copyToClipboard = document.querySelector(".password button");
  const pwd = document.querySelector(".password input[type=text]");
  const copied = document.querySelector('.password button div');

  copyToClipboard.addEventListener("click", () => {
    navigator.clipboard.writeText(pwd.value);
    copied.innerText = "COPIED"
  });
  main();
});
