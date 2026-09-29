// =========================================================
// ZOO — MAIN JS
// Cart / Drawer / Catalog filters / Item pages / Infinite scroll
// =========================================================

const CART_KEY = 'zoo-cart';


// =========================================================
// PRODUCT DATA
// =========================================================

const ITEMS = {
  '1': {
    id: '1',
    title: 'E a poesia dá à luz uma bússola louca',
    author: 'A. Dasilva O.',
    price: 15.99,
    cover: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=300&h=450&fit=crop',
    descriptionTop: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
    descriptionBottom: 'The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters.',
    label: 'Contracapa',
    publisher: 'Porto',
    link: '#'
  },

  '2': {
    id: '2',
    title: 'Livro 2',
    author: 'Autor',
    price: 15.99,
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop',
    descriptionTop: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.',
    descriptionBottom: 'The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters.',
    label: 'Contracapa',
    publisher: 'Porto',
    link: '#'
  }
};


// =========================================================
// CART STORAGE
// =========================================================

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}


// =========================================================
// PRICE
// =========================================================

function formatPrice(value) {
  return `${Number(value).toFixed(2).replace('.', ',')}€`;
}

function getSubtotal(cart) {
  return cart.reduce((total, item) => {
    return total + Number(item.price) * Number(item.quantity);
  }, 0);
}

const SHIPPING_KEY = 'zoo-shipping';

const SHIPPING_OPTIONS = {
  normal:    { label: 'correio normal',    price: 1.5 },
  registado: { label: 'correio registado', price: 4.0 }
};

function getShippingMethod() {
  const method = localStorage.getItem(SHIPPING_KEY);
  return SHIPPING_OPTIONS[method] ? method : 'normal';
}

function getShipping(cart) {
  return cart.length > 0 ? SHIPPING_OPTIONS[getShippingMethod()].price : 0;
}

function getShippingLabel() {
  return `Portes (${SHIPPING_OPTIONS[getShippingMethod()].label})`;
}

function getTotal(cart) {
  return getSubtotal(cart) + getShipping(cart);
}


// =========================================================
// ADD TO CART
// =========================================================

function addToCart(product) {

  if (!product) {
    console.error('Produto não encontrado.');
    return;
  }

  const cart = getCart();

  const existingItem = cart.find(
    item => item.id === product.id
  );

  if (existingItem) {

    existingItem.quantity =
      Number(existingItem.quantity || 0) + 1;

  } else {

    cart.push({
      id: product.id,
      title: product.title,
      author: product.author || '',
      price: Number(product.price),
      image: product.cover || '',
      quantity: 1
    });

  }

  saveCart(cart);

  updateCartDrawer();
  openCartDrawer();
}


// =========================================================
// REMOVE FROM CART
// =========================================================

function removeFromCart(id) {

  const cart = getCart().filter(
    item => item.id !== id
  );

  saveCart(cart);

  updateCartDrawer();
}


// =========================================================
// CHANGE QUANTITY
// =========================================================

function changeQuantity(id, amount) {

  const cart = getCart();

  const item = cart.find(
    item => item.id === id
  );

  if (!item) return;

  item.quantity =
    Number(item.quantity) + amount;

  if (item.quantity <= 0) {

    const newCart = cart.filter(
      item => item.id !== id
    );

    saveCart(newCart);

  } else {

    saveCart(cart);

  }

  updateCartDrawer();
}


// =========================================================
// OPEN CART
// =========================================================

function openCartDrawer() {

  const drawer =
    document.getElementById('cestoDrawer');

  const backdrop =
    document.getElementById('cestoBackdrop');

  if (!drawer) {
    console.error(
      'cestoDrawer não existe nesta página.'
    );
    return;
  }

  // Open first so incomplete checkout markup cannot block cart feedback.
  drawer.classList.add('open');

  if (backdrop) {
    backdrop.classList.add('open');
  }

  drawer.setAttribute(
    'aria-hidden',
    'false'
  );

  document.body.classList.add(
    'cesto-open'
  );

  showCartView();
  hideSuccess();
}


// =========================================================
// CLOSE CART
// =========================================================

function closeCartDrawer() {

  const drawer =
    document.getElementById('cestoDrawer');

  const backdrop =
    document.getElementById('cestoBackdrop');

  if (!drawer) return;

  // Remove focus before hiding the drawer
  if (
    document.activeElement &&
    drawer.contains(document.activeElement)
  ) {
    document.activeElement.blur();
  }

  drawer.classList.remove('open');

  if (backdrop) {
    backdrop.classList.remove('open');
  }

  drawer.setAttribute(
    'aria-hidden',
    'true'
  );

  document.body.classList.remove(
    'cesto-open'
  );
}


// =========================================================
// RENDER CART
// =========================================================

function updateCartDrawer() {

  const cart = getCart();

  const itemsContainer =
    document.getElementById('cestoItems');

  const emptyMessage =
    document.getElementById('cestoEmpty');

  const subtotalElement =
    document.getElementById('cestoSubtotal');

  const shippingElement =
    document.getElementById('cestoShipping');

  const totalElement =
    document.getElementById('cestoTotal');

  const checkoutButton =
    document.getElementById('checkoutBtn');

  if (!itemsContainer) return;

  itemsContainer.innerHTML = '';

  updateCheckoutTotals();

  // EMPTY CART
  if (cart.length === 0) {

    if (emptyMessage) {
      emptyMessage.style.display = 'block';
    }

    if (checkoutButton) {
      checkoutButton.disabled = true;
    }

  }

  // CART HAS ITEMS
  else {

    if (emptyMessage) {
      emptyMessage.style.display = 'none';
    }

    if (checkoutButton) {
      checkoutButton.disabled = false;
    }

    cart.forEach(item => {

      const itemElement =
        document.createElement('div');

      itemElement.className =
        'cesto-item';

      itemElement.innerHTML = `

        <div class="cesto-item-image">

          ${
            item.image
              ? `
                <img
                  src="${item.image}"
                  alt="${item.title}"
                >
              `
              : ''
          }

        </div>

        <div class="cesto-item-info">

          <h3>${item.title}</h3>

          ${
            item.author
              ? `
                <p class="cesto-item-author">
                  ${item.author}
                </p>
              `
              : ''
          }

          <p class="cesto-item-price">
            ${formatPrice(item.price)}
          </p>

          <div class="cesto-quantity">

            <button
              type="button"
              class="quantity-btn"
              data-action="decrease"
              data-id="${item.id}"
            >
              −
            </button>

            <span>
              ${item.quantity}
            </span>

            <button
              type="button"
              class="quantity-btn"
              data-action="increase"
              data-id="${item.id}"
            >
              +
            </button>

          </div>

          <button
            type="button"
            class="remove-item"
            data-id="${item.id}"
          >
            remover
          </button>

        </div>
      `;

      itemsContainer.appendChild(
        itemElement
      );

    });
  }

  const subtotal =
    getSubtotal(cart);

  const shipping =
    getShipping(cart);

  const total =
    getTotal(cart);

  if (subtotalElement) {
    subtotalElement.textContent =
      formatPrice(subtotal);
  }

  if (shippingElement) {
    shippingElement.textContent =
      formatPrice(shipping);
  }

  if (totalElement) {
    totalElement.textContent =
      formatPrice(total);
  }
  const shippingLabel = document.getElementById('cestoShippingLabel');
  if (shippingLabel) {
    shippingLabel.textContent = cart.length > 0 ? getShippingLabel() : 'Portes';
  }
}


// =========================================================
// CHECKOUT (INSIDE CART DRAWER)
// =========================================================

function showCartView() {
  const cartView = document.getElementById('cestoViewCart');
  const checkoutForm = document.getElementById('checkoutForm');
  const backButton = document.getElementById('cestoBack');
  const title = document.getElementById('cestoTitle');

  if (cartView) cartView.hidden = false;
  if (checkoutForm) checkoutForm.hidden = true;
  if (backButton) backButton.hidden = true;
  if (title) title.textContent = 'cesto';
}

function showCheckoutView() {
  if (getCart().length === 0) return;

  const cartView = document.getElementById('cestoViewCart');
  const checkoutForm = document.getElementById('checkoutForm');

  if (!cartView || !checkoutForm) return;

  cartView.hidden = true;
  checkoutForm.hidden = false;

  const backButton = document.getElementById('cestoBack');
  const title = document.getElementById('cestoTitle');
  if (backButton) backButton.hidden = false;
  if (title) title.textContent = 'finalizar compra';

  document.querySelectorAll('input[name="envio"]').forEach(r => {
    r.checked = r.value === getShippingMethod();
  });

  const checkoutBody = checkoutForm.querySelector('.cesto-drawer-body');
  if (checkoutBody) checkoutBody.scrollTop = 0;
  updateCheckoutTotals();
}

function updateCheckoutTotals() {
  const cart = getCart();
  const subtotal = document.getElementById('coSubtotal');
  const shippingLabel = document.getElementById('coShippingLabel');
  const shipping = document.getElementById('coShipping');
  const total = document.getElementById('coTotal');

  if (subtotal) subtotal.textContent = formatPrice(getSubtotal(cart));
  if (shippingLabel) shippingLabel.textContent = getShippingLabel();
  if (shipping) shipping.textContent = formatPrice(getShipping(cart));
  if (total) total.textContent = formatPrice(getTotal(cart));
}

// Add the shared checkout UI to pages that only contain the basic cart drawer.
function ensureCheckoutMarkup() {
  const drawer = document.getElementById('cestoDrawer');
  if (!drawer || document.getElementById('checkoutForm')) return;

  const cartBody = drawer.querySelector('.cesto-drawer-body');
  const cartFooter = drawer.querySelector('.cesto-drawer-footer');
  if (!cartBody || !cartFooter) return;

  const header = drawer.querySelector('.cesto-drawer-header');
  const heading = header?.querySelector('h2');
  if (heading && !document.getElementById('cestoBack')) {
    heading.id = 'cestoTitle';

    const headerLeft = document.createElement('div');
    headerLeft.className = 'cesto-header-left';

    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = 'cesto-back';
    backButton.id = 'cestoBack';
    backButton.setAttribute('aria-label', 'Voltar ao cesto');
    backButton.textContent = '←';
    backButton.hidden = true;

    header.insertBefore(headerLeft, heading);
    headerLeft.append(backButton, heading);
  }

  const cartView = document.createElement('div');
  cartView.className = 'cesto-view';
  cartView.id = 'cestoViewCart';
  drawer.insertBefore(cartView, cartBody);
  cartView.append(cartBody, cartFooter);

  const form = document.createElement('form');
  form.className = 'cesto-view';
  form.id = 'checkoutForm';
  form.noValidate = true;
  form.hidden = true;
  form.innerHTML = `
    <div class="cesto-drawer-body">
      <h3 class="checkout-section">Faturação</h3>
      <div class="form-grid">
        <div class="form-field full"><label for="nome">Nome</label><input id="nome" name="nome" type="text" autocomplete="name" required></div>
        <div class="form-field full"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required></div>
        <div class="form-field"><label for="telefone">Telefone</label><input id="telefone" name="telefone" type="tel" autocomplete="tel" required></div>
        <div class="form-field"><label for="nif">NIF</label><input id="nif" name="nif" type="text" inputmode="numeric" maxlength="9" pattern="\\d{9}" required></div>
        <div class="form-field full"><label for="morada">Morada</label><input id="morada" name="morada" type="text" autocomplete="street-address" required></div>
        <div class="form-field"><label for="cp">Código postal</label><input id="cp" name="cp" type="text" placeholder="0000-000" pattern="\\d{4}-\\d{3}" maxlength="8" autocomplete="postal-code" required></div>
        <div class="form-field"><label for="localidade">Localidade</label><input id="localidade" name="localidade" type="text" autocomplete="address-level2" required></div>
      </div>

      <h3 class="checkout-section">Prenda?</h3>
      <label class="check-line"><input type="checkbox" id="giftToggle"><span>é uma prenda — enviar para outra morada</span></label>
      <div class="form-grid" id="giftFields" hidden>
        <div class="form-field full"><label for="gNome">Nome do destinatário</label><input id="gNome" name="gNome" type="text"></div>
        <div class="form-field full"><label for="gMorada">Morada de entrega</label><input id="gMorada" name="gMorada" type="text"></div>
        <div class="form-field"><label for="gCp">Código postal</label><input id="gCp" name="gCp" type="text" placeholder="0000-000" pattern="\\d{4}-\\d{3}" maxlength="8"></div>
        <div class="form-field"><label for="gLocalidade">Localidade</label><input id="gLocalidade" name="gLocalidade" type="text"></div>
      </div>

      <h3 class="checkout-section">Envio</h3>
      <label class="radio-line"><input type="radio" name="envio" value="normal" checked><span>Correio normal</span><span class="radio-price">1,50€</span></label>
      <label class="radio-line"><input type="radio" name="envio" value="registado"><span>Correio registado</span><span class="radio-price">4,00€</span></label>
    </div>
    <div class="cesto-drawer-footer">
      <p class="form-error" id="formError" role="alert"></p>
      <div class="summary-line"><span>Subtotal</span><span id="coSubtotal">0,00€</span></div>
      <div class="summary-line"><span id="coShippingLabel">Portes</span><span id="coShipping">0,00€</span></div>
      <div class="summary-line total"><span>Total</span><span class="amount" id="coTotal">0,00€</span></div>
      <button type="submit" class="checkout-btn" id="placeOrderBtn">confirmar encomenda</button>
    </div>
  `;
  cartView.after(form);

  const success = document.createElement('div');
  success.className = 'cesto-success';
  success.id = 'cestoSuccess';
  success.setAttribute('role', 'dialog');
  success.setAttribute('aria-live', 'polite');
  success.hidden = true;
  success.innerHTML = `
    <div class="cesto-success-box">
      <div class="cesto-success-icon">✓</div>
      <h3>encomenda confirmada!</h3>
      <p>Obrigado! Vais receber um email de confirmação em breve.</p>
      <button type="button" class="checkout-btn" id="cestoSuccessClose">fechar</button>
    </div>
  `;
  form.after(success);
}

function showSuccess() {
  const box = document.getElementById('cestoSuccess');
  if (!box) {
    console.error('#cestoSuccess não existe nesta página.');
    return;
  }
  box.hidden = false;
}

function hideSuccess() {
  const box = document.getElementById('cestoSuccess');
  if (box) box.hidden = true;
}

function setupCheckout() {

  const form = document.getElementById('checkoutForm');
  const giftToggle = document.getElementById('giftToggle');
  const giftFields = document.getElementById('giftFields');
  const errorBox = document.getElementById('formError');

  if (!form || !giftToggle || !giftFields || !errorBox) return;

   // back arrow
  const backBtn = document.getElementById('cestoBack');
  if (backBtn) backBtn.addEventListener('click', showCartView);

  // success popup close
  const successClose = document.getElementById('cestoSuccessClose');
  if (successClose) successClose.addEventListener('click', closeCartDrawer);

  // shipping method
  form.querySelectorAll('input[name="envio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      localStorage.setItem(SHIPPING_KEY, radio.value);
      updateCartDrawer();       // also refreshes the checkout totals
    });
  });

  // gift address
  giftToggle.addEventListener('change', () => {
    giftFields.hidden = !giftToggle.checked;
    giftFields.querySelectorAll('input').forEach(i => {
      i.required = giftToggle.checked;
      if (!giftToggle.checked) i.classList.remove('invalid');
    });
  });

  // submit
  form.addEventListener('submit', event => {
    event.preventDefault();
    errorBox.textContent = '';

    const inputs = form.querySelectorAll(
      'input[type="text"], input[type="email"], input[type="tel"]'
    );
    let firstInvalid = null;

    inputs.forEach(input => {
      const skip = input.closest('#giftFields') && !giftToggle.checked;
      const value = input.value.trim();
      let ok = true;

      if (!skip) {
        if (input.required && !value) ok = false;
        if (value && input.pattern && !new RegExp(`^${input.pattern}$`).test(value)) ok = false;
        if (value && input.type === 'email' && !input.checkValidity()) ok = false;
      }

      input.classList.toggle('invalid', !ok);
      if (!ok && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      errorBox.textContent = 'Verifica os campos assinalados.';
      firstInvalid.focus();
      return;
    }

    const cart = getCart();
    if (cart.length === 0) return;

    const data = Object.fromEntries(new FormData(form).entries());
    const order = {
      date: new Date().toISOString(),
      customer: {
        nome: data.nome, email: data.email, telefone: data.telefone,
        nif: data.nif, morada: data.morada, cp: data.cp, localidade: data.localidade
      },
      gift: giftToggle.checked
        ? { nome: data.gNome, morada: data.gMorada, cp: data.gCp, localidade: data.gLocalidade }
        : null,
           shipping: { method: getShippingMethod(), price: getShipping(cart) },
      payment: data.pagamento,
      items: cart,
      subtotal: getSubtotal(cart),
      total: getTotal(cart)
    };

    // TODO: send `order` to your backend / payment provider here
    console.log('ORDER', order);

    // clear everything and show the popup
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(SHIPPING_KEY);
    form.reset();
    giftFields.hidden = true;
    updateCartDrawer();
    showCartView();
    showSuccess();
  });
}
// =========================================================
// ITEM PAGE
// =========================================================

function setupItemPage() {

  const itemGrid =
    document.getElementById('itemGrid');

  if (!itemGrid) return;

  const params =
    new URLSearchParams(
      window.location.search
    );

  const id =
    params.get('id');

  const item =
    ITEMS[id];

  if (!item) {
    console.error(
      'Produto não encontrado. ID:',
      id
    );
    return;
  }

  // Fill item information if elements exist

  const title =
    document.getElementById('itemTitle');

  if (title) {
    title.textContent = item.title;
  }

  const author =
    document.getElementById('itemAuthor');

  if (author) {
    author.textContent = item.author;
  }

  const cover =
    document.getElementById('itemCover');

  if (cover) {
    cover.src = item.cover;
    cover.alt = item.title;
  }

  const descriptionTop =
    document.getElementById(
      'itemDescriptionTop'
    );

  if (descriptionTop) {
    descriptionTop.textContent =
      item.descriptionTop;
  }

  const descriptionBottom =
    document.getElementById(
      'itemDescriptionBottom'
    );

  if (descriptionBottom) {
    descriptionBottom.textContent =
      item.descriptionBottom;
  }

  const specLabel =
    document.getElementById(
      'specLabel'
    );

  if (specLabel) {
    specLabel.textContent =
      item.label;
  }

  const specPublisher =
    document.getElementById(
      'specPublisher'
    );

  if (specPublisher) {
    specPublisher.textContent =
      item.publisher;
  }

  const specLink =
    document.getElementById(
      'specLink'
    );

  if (specLink) {
    specLink.href =
      item.link;
  }


  // ADD BUTTON

  const addButton =
    document.getElementById(
      'addToCartBtn'
    );

  if (!addButton) {

    console.error(
      'Não encontrei #addToCartBtn no item.html'
    );

    return;
  }

  addButton.addEventListener(
    'click',
    function() {

      addToCart(item);

    }
  );
}


// =========================================================
// CART CLICK EVENTS
// =========================================================

function setupCartEvents() {

  document.addEventListener(
    'click',
    function(event) {

      // OPEN CART

      const cartTrigger =
        event.target.closest(
          '.cesto-trigger'
        );

      if (cartTrigger) {

        event.preventDefault();

        updateCartDrawer();
        openCartDrawer();

        return;
      }


      // CLOSE BUTTON

      const closeButton =
        event.target.closest(
          '#cestoClose'
        );

      if (closeButton) {

        closeCartDrawer();

        return;
      }


      // BACKDROP

      if (
        event.target.id ===
        'cestoBackdrop'
      ) {

        closeCartDrawer();

        return;
      }


      // QUANTITY

      const quantityButton =
        event.target.closest(
          '.quantity-btn'
        );

      if (quantityButton) {

        const id =
          quantityButton.dataset.id;

        const action =
          quantityButton.dataset.action;

        if (action === 'increase') {
          changeQuantity(id, 1);
        }

        if (action === 'decrease') {
          changeQuantity(id, -1);
        }

        return;
      }


      // REMOVE

      const removeButton =
        event.target.closest(
          '.remove-item'
        );

      if (removeButton) {

        removeFromCart(
          removeButton.dataset.id
        );

        return;
      }


      // CHECKOUT

      const checkoutButton =
        event.target.closest(
          '#checkoutBtn'
        );

      if (checkoutButton) {

        const cart =
          getCart();

        if (cart.length === 0) {
          return;
        }

        showCheckoutView();

      }

    }
  );


  // ESC KEY

  document.addEventListener(
    'keydown',
    function(event) {

      if (event.key === 'Escape') {
        closeCartDrawer();
      }

    }
  );
}


// =========================================================
// CATALOG FILTERS
// =========================================================

function setupCatalogFilters() {

  const filtrosToggle =
    document.getElementById(
      'filtrosToggle'
    );

  const filterFields =
    document.getElementById(
      'filterFields'
    );

  if (
    filtrosToggle &&
    filterFields
  ) {

    filtrosToggle.addEventListener(
      'click',
      function() {

        const isOpen =
          filterFields.classList.toggle(
            'open'
          );

        filtrosToggle.setAttribute(
          'aria-expanded',
          isOpen ? 'true' : 'false'
        );

        const arrow =
          filtrosToggle.querySelector(
            '.arrow'
          );

        if (arrow) {

          arrow.innerHTML =
            isOpen
              ? '&#8963;'
              : '&#8964;';

        }

      }
    );

  }


  const filterSelects =
    document.querySelectorAll(
      '.filter-select'
    );

  if (!filterSelects.length) return;

  filterSelects.forEach(
    select => {

      const btn =
        select.querySelector(
          '.filter-select-btn'
        );

      const options =
        select.querySelectorAll(
          '.filter-select-options li'
        );

      if (!btn) return;

      btn.addEventListener(
        'click',
        function(event) {

          event.stopPropagation();

          const isOpen =
            select.classList.contains(
              'open'
            );

          filterSelects.forEach(
            s =>
              s.classList.remove(
                'open'
              )
          );

          if (!isOpen) {
            select.classList.add(
              'open'
            );
          }

        }
      );

      options.forEach(
        option => {

          option.addEventListener(
            'click',
            function() {

              selectFilterOption(select, option);

            }
          );

        }
      );

    }
  );

  document.addEventListener(
    'click',
    function() {

      filterSelects.forEach(
        s =>
          s.classList.remove(
            'open'
          )
      );

    }
  );
}

// Shared by manual clicks and the URL-driven auto-select below, so
// both paths mark the <li> as selected, update the button label, and
// stash the value on the button's dataset the same way.
function selectFilterOption(select, option) {

  const btn = select.querySelector('.filter-select-btn');
  const options = select.querySelectorAll('.filter-select-options li');

  options.forEach(o => o.classList.remove('selected'));
  option.classList.add('selected');

  if (btn) {
    btn.textContent = option.textContent;
    btn.dataset.value = option.dataset.value;
  }

  select.classList.remove('open');
}

// If the catálogo page was opened with `?tipo=livro` or
// `?tipo=disco` (e.g. from the LIVROS / MÚSICA links on the
// homepage), pre-select the matching option in the "Tipo" filter
// and open the filtros panel so it's visible.
//
// NOTE: this only pre-selects the filter visually — it doesn't hide
// non-matching products yet, since the product cards in catalogo.html
// don't currently carry a data-type attribute to filter against.
// Add e.g. data-tipo="livro" to each .card-product and extend this
// function to show/hide by it once that's in place.
function applyTipoFromURL() {

  const filterFields = document.getElementById('filterFields');
  const tipoSelect = document.querySelector('.filter-select[data-filter="tipo"]');

  if (!filterFields || !tipoSelect) return;

  const params = new URLSearchParams(window.location.search);
  const tipo = params.get('tipo');

  if (!tipo) return;

  const option = tipoSelect.querySelector(`li[data-value="${tipo}"]`);

  if (!option) return;

  selectFilterOption(tipoSelect, option);

  filterFields.classList.add('open');

  const filtrosToggle = document.getElementById('filtrosToggle');
  if (filtrosToggle) {
    filtrosToggle.setAttribute('aria-expanded', 'true');
  }
}


// =========================================================
// CATÁLOGO — INFINITE SCROLL
// Product cards are absolutely positioned in pixel rows (3 per row,
// 440px apart, starting at top:520px), so "loading more" means:
// append a new row of .card-product elements at the next computed
// top offset, and grow #catalogGrid's own height to match.
//
// samplePool below is placeholder/demo data. Swap the body of
// loadNextRow() for a real fetch() to your product API (passing a
// page/offset param) once you have one — the DOM-building part
// stays the same.
// =========================================================

function setupCatalogInfiniteScroll() {

  const grid = document.getElementById('catalogGrid');
  if (!grid) return; // only runs on catalogo.html

  const ROW_HEIGHT = 440;
  const FIRST_ROW_TOP = 520;
  const BOTTOM_BUFFER = 120;
  const MAX_ROWS = 12; // demo safety cap — drive this from a real "hasMore" flag later

  const COLS = [
    { left: '6.7%', width: 'calc(25% + 4px)' },
    { left: '37.8%', width: 'calc(24.5% + 4px)' },
    { left: '68.5%', width: 'calc(25% + 4px)' }
  ];

  const samplePool = [
    { price: '15.99€', title: 'Música dos Séculos<br>de José Campos', img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop' },
    { price: '15.99€', title: 'E a poesia dá à luz uma bússola louca<br>A. Dasilva O.', img: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=300&h=450&fit=crop' },
    { price: '18.50€', title: 'Terebentina<br>Vários Artistas', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=450&fit=crop' },
    { price: '21.00€', title: 'Registos Soltos<br>de A. Dasilva O.', img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=450&fit=crop' }
  ];

  // 2 rows (6 products) already exist in the static HTML
  let rowsLoaded = 2;
  let loading = false;

  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'catalogo-loading';
  loadingIndicator.textContent = 'a carregar mais…';
  loadingIndicator.style.display = 'none';
  grid.appendChild(loadingIndicator);

  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute; left:0; width:1px; height:1px;';
  grid.appendChild(sentinel);

  function positionMarkers() {
    const nextTop = FIRST_ROW_TOP + rowsLoaded * ROW_HEIGHT;
    sentinel.style.top = `${nextTop}px`;
    loadingIndicator.style.top = `${nextTop}px`;
    grid.style.height = `${nextTop + BOTTOM_BUFFER}px`;
  }
  positionMarkers();

  function loadNextRow() {
    if (loading || rowsLoaded >= MAX_ROWS) {
      if (rowsLoaded >= MAX_ROWS) observer.disconnect();
      return;
    }
    loading = true;
    loadingIndicator.style.display = 'block';

    // simulate network latency; replace with a real fetch() when wired to a backend
    setTimeout(() => {
      const top = FIRST_ROW_TOP + rowsLoaded * ROW_HEIGHT;

      COLS.forEach((col, i) => {
        const product = samplePool[(rowsLoaded * 3 + i) % samplePool.length];
        const card = document.createElement('div');
        card.className = 'card card-product';
        card.style.top = `${top}px`;
        card.style.left = col.left;
        card.style.width = col.width;
        card.style.marginLeft = '-2px';
      card.innerHTML = `
  <a href="item.html?id=${(rowsLoaded * 3 + i) % 2 + 1}">
    <p class="product-price">${product.price}</p>
    <img class="product-cover" src="${product.img}" alt="">
    <p class="product-title">${product.title}</p>
  </a>`;
        grid.insertBefore(card, sentinel);
      });

      rowsLoaded += 1;
      loading = false;
      loadingIndicator.style.display = 'none';
      positionMarkers();

      if (rowsLoaded >= MAX_ROWS) observer.disconnect();
    }, 400);
  }

  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => entry.isIntersecting && loadNextRow()),
    { rootMargin: '800px 0px 800px 0px' }
  );
  observer.observe(sentinel);
}


// =========================================================
// CURRENT-PAGE NAV HIGHLIGHT
// =========================================================

function setupCurrentNavHighlight() {

  const currentFile =
    window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-cell, .footer-nav a').forEach(link => {

    const href = link.getAttribute('href');
    if (!href) return;

    const linkFile = href.split('/').pop().split('?')[0];

    if (linkFile && linkFile === currentFile) {
      link.classList.add('current');
    }

  });
}

function setupSearch() {

  const searchCell =
    document.querySelector('.search-cell');

  const searchIcon =
    document.querySelector('.search-icon');

  const searchInput =
    document.querySelector('.search-input');

  if (!searchCell || !searchIcon || !searchInput) {
    return;
  }


  searchIcon.addEventListener('click', function(event) {

    event.preventDefault();
    event.stopPropagation();

    const isOpen =
      searchCell.classList.toggle('search-open');

    if (isOpen) {

      setTimeout(function() {
        searchInput.focus();
      }, 300);

    } else {

      searchInput.blur();

    }

  });


  searchInput.addEventListener('click', function(event) {
    event.stopPropagation();
  });


  document.addEventListener('click', function(event) {

    if (!searchCell.contains(event.target)) {

      searchCell.classList.remove('search-open');

      searchInput.blur();

    }

  });


  searchInput.addEventListener('keydown', function(event) {

    if (event.key === 'Escape') {
      searchCell.classList.remove('search-open');
      searchInput.blur();
      return;
    }

    if (event.key !== 'Enter') return;

    const query =
      searchInput.value.trim();

    if (!query) return;

    window.location.href =
      `catalogo.html?search=${encodeURIComponent(query)}`;

  });

}

document.addEventListener(
  'DOMContentLoaded',
  function() {
    ensureCheckoutMarkup();
    updateCartDrawer();
    setupCartEvents();
    setupCheckout();
    setupItemPage();
    setupCatalogFilters();
    applyTipoFromURL();
    setupCatalogInfiniteScroll();
    setupCurrentNavHighlight();
    setupSearch(); // <-- Kept inside DOMContentLoaded

    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === '1' && getCart().length > 0) {
      updateCartDrawer();
      openCartDrawer();
      showCheckoutView();
    }
  }
);
