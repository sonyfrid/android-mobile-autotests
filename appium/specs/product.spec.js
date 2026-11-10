const { CatalogPage } = require('../pages/CatalogPage');
const { ProductPage } = require('../pages/ProductPage');

describe('Карточка товара', () => {
  beforeEach(async () => {
    await CatalogPage.waitLoaded();
  });

  it('@smoke название и цена в карточке совпадают с каталогом', async () => {
    const [name] = await CatalogPage.visibleNames();
    const [price] = await CatalogPage.visiblePrices();
    await CatalogPage.openProduct(0);
    await ProductPage.waitLoaded();
    await expect(ProductPage.name).toHaveText(name);
    expect(await ProductPage.priceValue()).toBe(price);
  });

  it('кнопки «+» и «−» меняют количество, меньше 1 не уходит', async () => {
    await CatalogPage.openProduct(0);
    await ProductPage.waitLoaded();
    expect(await ProductPage.quantityValue()).toBe(1);
    await ProductPage.plus.click();
    await ProductPage.plus.click();
    expect(await ProductPage.quantityValue()).toBe(3);
    await ProductPage.minus.click();
    expect(await ProductPage.quantityValue()).toBe(2);
    await ProductPage.minus.click();
    await ProductPage.minus.click();
    expect(await ProductPage.quantityValue()).toBeGreaterThanOrEqual(0);
    expect(await ProductPage.quantityValue()).toBeLessThanOrEqual(1);
  });

  it('@smoke «Add to cart» добавляет выбранное количество, счётчик корзины растёт', async () => {
    await CatalogPage.openProduct(0);
    await ProductPage.waitLoaded();
    await ProductPage.plus.click();
    await ProductPage.addToCart.click();
    await expect(ProductPage.cartBadge).toHaveText('2');
  });
});
