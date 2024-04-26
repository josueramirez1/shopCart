import items from "./items.json";

// Get selectors
const cartBtn = document.querySelector("[data-btn]");
const cartPath = document.querySelector("[data-path-btn]");
const cartBox = document.querySelector("[data-cart-box]");
const svgCartBtn = document.querySelector("[data-svg-btn]");
let redCounter = document.querySelector("div.rounded-full");
const colorName = [...document.querySelectorAll("[data-color-name]")];
let colorCart = document.querySelector("[data-color-cart]");

// Retrieve local storage items
let savedColors = JSON.parse(localStorage.getItem("colorBoxes"));
let savedPrice = JSON.parse(localStorage.getItem("totalPrice"));

// If local storage contains values...
if (savedColors !== null && savedPrice !== 0) {
  // Show shopping cart button
  cartBtn.classList.remove("hidden");

  // Select cart and total html
  let cart = cartBtn.previousElementSibling.children[0].children[0];
  let price =
    cartBtn.previousElementSibling.children[0].children[1].children[1];

  // Attached saved colors to shopping cart
  savedColors.forEach((savedBox) => {
    cart.innerHTML += savedBox;
  });
  // Attach saved price to total price
  price.innerHTML = `$${savedPrice}.00`;
  // For each array item in local storage add red counter
  redCounter.innerText = savedColors.length;
}
// Converting to total price string to number to add or subtract item color prices.
let section = document.querySelector("section.text-gray-700.body-font");
let totalPriceString =
  section.nextElementSibling.children[0].children[0].children[1].children[1];
let totalPriceNum = parseInt(totalPriceString.innerHTML.substring(1, 8));
let colorBoxes = Array.from(document.querySelectorAll(".mb-6"));

// This counter resets in order to allow counting for other boxes in same cart
let count = 2;

// EVENT LISTENERS

// This event listener is for adding things to cart
document.addEventListener("click", (e) => {
  // If user clicks on svg button, the shopping cart will appear
  if (
    e.target === cartBtn ||
    e.target === svgCartBtn ||
    e.target === cartPath
  ) {
    cartBox.classList.toggle("hidden");
  }
  // If user clicks "ADD TO CART" then
  if (
    e.target.matches("button.text-white.py-2.px-4.text-xl.bg-blue-500.rounded")
  ) {
    for (let color of colorName) {
      // if button and color share parent, check to see if color is in shopping cart as well...
      if (e.target.closest(".mt-4") === color.closest(".mt-4")) {
        // if visibility is hidden, make button visible
        if (cartBtn.matches(".hidden") && cartBox.matches(".hidden")) {
          cartBtn.classList.remove("hidden");
        }
        let newColorBoxes = colorBoxes.filter((colorBox) => {
          // Return items that match the color that is to be added
          return (
            colorBox.children[1].children[0].children[0].innerHTML ===
            e.target.previousElementSibling.children[1].innerText
          );
        });
        // if new array shows empty, it means that color is not in shopping cart so add a new color block
        if (newColorBoxes.length === 0) {
          let numRedCounter = parseInt(redCounter.innerText) + 1;
          redCounter.innerText = numRedCounter;
          addBlock(color);
          return;
        }
        // but...
        colorBoxes.forEach((colorBox) => {
          //  if color is already in shopping cart...
          if (
            color.closest(".mt-4").children[0].children[1].innerText ===
            colorBox.children[1].children[0].children[0].innerHTML
          ) {
            // and if item does not contain a counter, add a counter

            if (!colorBox.children[1].children[0].children[1]) {
              let span = document.createElement("span");
              span.innerText = `x${count}`;
              span.classList.add(
                "text-gray-600",
                "text-sm",
                "font-bold",
                "ml-1"
              );

              colorBox.children[1].children[0].append(span);
              addSingleAndTotal(color, colorBox);
              count = 2;
              return;
            }
            // or if item already has a counter, continue adding up
            if (colorBox.children[1].children[0].children.length > 1) {
              if (
                color.closest(".mt-4").children[0].children[1].innerText ===
                colorBox.children[1].children[0].children[0].innerHTML
              ) {
                let newCount = parseInt(
                  colorBox.children[1].children[0].children[0].nextElementSibling.innerHTML.substring(
                    1,
                    10
                  )
                );
                colorBox.children[1].children[0].children[0].nextElementSibling.innerHTML = `x${++newCount}`;
                addSingleAndTotal(color, colorBox);
                return;
              }
            }
          }
        });
      }
    }
  }
});

// This event listener removes item from cart and array
document.addEventListener("click", (e) => {
  for (let colorBox of colorBoxes) {
    // if user clicks on close button...
    if (e.target.closest(".mb-6") === colorBox.closest(".mb-6")) {
      let colorToEnter =
        e.target.parentElement.nextElementSibling.children[0].children[0];
      // if color box and color share the same name...
      if (
        colorToEnter.textContent ===
        colorBox.children[1].children[0].children[0].textContent
      ) {
        // Remove one counter and subtract from total price
        let subRedCounter = parseInt(redCounter.innerText) - 1;
        redCounter.innerText = subRedCounter;
        subtractSingleAndTotal(colorToEnter, colorBox);
        // If the red counter turns to zero
        if (subRedCounter === 0) {
          // Remove both shopping cart and icon from sight
          cartBtn.classList.add("hidden");
          cartBox.classList.add("hidden");
        }
        // Remove item from array
        const item = colorBoxes.indexOf(colorBox);
        if (item > -1) {
          colorBoxes.splice(item, 1);
        }
        // Remove color box from shopping cart
        colorBox.remove();
        toLocalStorage(totalPriceNum);
        return;
      }
    }
  }
});

// Functions

function addBlock(color, colorBox) {
  for (let object of items) {
    if (color.innerText === object.name) {
      let convertToString = object.priceCents.toString();
      let truePrice = parseInt(convertToString.substring(0, 2));
      let cBox = document.createElement("div");
      cBox.classList.add("mb-6");
      cBox.innerHTML = createColorBlock(
        object.name,
        truePrice,
        object.imageColor
      );
      totalPriceNum = totalPriceNum + truePrice;
      totalPriceString.textContent = `$${totalPriceNum}.00`;
      colorBoxes.push(cBox);
      colorCart.append(cBox);

      // Update local storage
      toLocalStorage(totalPriceNum);
    }
  }
}

function addSingleAndTotal(color, colorBox) {
  for (let object of items) {
    if (color.innerText === object.name) {
      let convertToString = object.priceCents.toString();
      let truePrice = parseInt(convertToString.substring(0, 2));
      let singlePriceItem = parseInt(
        colorBox.children[1].children[1].innerHTML.substring(1, 8)
      );
      let totalSinglePriceItem = truePrice + singlePriceItem;
      colorBox.children[1].children[1].textContent = `$${totalSinglePriceItem}.00`;
      totalPriceNum = totalPriceNum + truePrice;
      totalPriceString.textContent = `$${totalPriceNum}.00`;

      toLocalStorage(totalPriceNum);
    }
  }
}

function subtractSingleAndTotal(color, colorBox) {
  for (let object of items) {
    if (color.innerText === object.name) {
      let convertToString = object.priceCents.toString();
      let truePrice = parseInt(convertToString.substring(0, 2));
      if (colorBox.children[1].children[0].children[1] != undefined) {
        let newCount = parseInt(
          colorBox.children[1].children[0].children[0].nextElementSibling.innerText.substring(
            1,
            8
          )
        );
        let addedPrice = truePrice * newCount;
        totalPriceNum = totalPriceNum - addedPrice;
        totalPriceString.textContent = `$${totalPriceNum}.00`;
      } else totalPriceNum = totalPriceNum - truePrice;
      totalPriceString.textContent = `$${totalPriceNum}.00`;
    }
  }
}

function createColorBlock(name, price, color) {
  let result = `<div class="block relative h-24 rounded overflow-hidden"><img alt="ecommerce"class="object-cover object-center w-full h-full block rounded"src="https://dummyimage.com/210x130/${color}/${color}"/><button data-remove-from-cart-button class="absolute top-0 right-0 bg-black rounded-tr text-white w-6 h-6 text-lg flex justify-center items-center">&times;</button></div><div class="mt-2 flex justify-between"><div class="flex items-center title-font"><h2 class="text-gray-900 text-lg font-medium">${name}</h2></div><div>$${price}.00</div></div>`;

  return result;
}

function toLocalStorage(total) {
  // Log html code colors
  let newBoxes = colorBoxes.map((box) => {
    return box.outerHTML;
  });
  let string = JSON.stringify(newBoxes);
  localStorage.setItem("colorBoxes", string);
  // Log total price
  localStorage.setItem("totalPrice", total);
}
