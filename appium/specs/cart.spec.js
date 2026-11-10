const { CatalogPage } = require('../pages/CatalogPage');
const { ProductPage } = require('../pages/ProductPage');
const { CartPage } = require('../pages/CartPage');

const round = (n) => Math.round(n * 100) / 100;

async function addProduct(index, times = 1) {
  await CatalogPage.openProduct(index);
  await ProductPage.waitLoaded();
  for (let i = 1; i < times; i++) await ProductPage.plus.click();
  await ProductPage.addToCart.click();
  await driver.back();
  await CatalogPage.waitLoaded();
}

describe('Корзина', () => {
  beforeEach(async () => {
    await CatalogPage.waitLoaded();
  });

  it('пустая корзина: сообщение и кнопка «Go Shopping» ведёт в каталог', async () => {
    await CatalogPage.openCart();
    await expect(CartPage.emptyTitle).toBeDisplayed();
    await CartPage.goShopping.click();
    await CatalogPage.waitLoaded();
  });

  it('@smoke два разных товара: оба в корзине, итог равен сумме цен', async () => {
    const names = await CatalogPage.visibleNames();
    const prices = await CatalogPage.visiblePrices();
    await addProduct(0);
    await addProduct(1);
    expect(await CatalogPage.cartCount()).toBe(2);

    await CatalogPage.openCart();
    await expect(CartPage.title).toBeDisplayed();
    const inCart = await CartPage.names();
    expect(inCart).toEqual(expect.arrayContaining([names[0], names[1]]));
    expect(await CartPage.totalValue()).toBe(round(prices[0] + prices[1]));
  });

  it('увеличение количества в корзине пересчитывает итог', async () => {
    const [price] = await CatalogPage.visiblePrices();
    await addProduct(0);
    await CatalogPage.openCart();
    expect(await CartPage.totalValue()).toBe(price);
    await CartPage.increase(0);
    await expect(CartPage.itemQuantities[0]).toHaveText('2');
    expect(await CartPage.totalValue()).toBe(round(price * 2));
    expect(await CartPage.cartCount()).toBe(2);
  });

  it('удаление последнего товара показывает пустую корзину и обнуляет счётчик', async () => {
    await addProduct(0);
    await CatalogPage.openCart();
    await CartPage.remove(0);
    await expect(CartPage.emptyTitle).toBeDisplayed();
    expect(await CartPage.cartCount()).toBe(0);
  });

  it('корзина сохраняется, если свернуть и вернуть приложение', async () => {
    await addProduct(0, 3);
    expect(await CatalogPage.cartCount()).toBe(3);
    await CatalogPage.sendToBackground(3);
    await CatalogPage.waitLoaded();
    expect(await CatalogPage.cartCount()).toBe(3);
  });

  it('корзина сохраняется при повороте экрана', async () => {
    await addProduct(0, 2);
    await driver.setOrientation('LANDSCAPE');
    try {
      await CatalogPage.cartBadge.waitForDisplayed();
      expect(await CatalogPage.cartCount()).toBe(2);
    } finally {
      await driver.setOrientation('PORTRAIT');
    }
  });
});
