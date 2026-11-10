const { CatalogPage } = require('../pages/CatalogPage');

const sortedAsc = (list) => [...list].sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));

describe('Каталог', () => {
  beforeEach(async () => {
    await CatalogPage.waitLoaded();
  });

  it('@smoke после запуска открывается каталог с товарами и ценами', async () => {
    await expect(CatalogPage.title).toHaveText('Products');
    const names = await CatalogPage.visibleNames();
    const prices = await CatalogPage.visiblePrices();
    expect(names.length).toBeGreaterThan(0);
    expect(prices.length).toBe(names.length);
    for (const p of prices) expect(p).toBeGreaterThan(0);
    expect(await CatalogPage.cartCount()).toBe(0);
  });

  it('сортировка по названию от А до Я', async () => {
    await CatalogPage.sortBy('Ascending order by name');
    const names = await CatalogPage.visibleNames();
    expect(names).toEqual(sortedAsc(names));
  });

  it('сортировка по названию от Я до А', async () => {
    await CatalogPage.sortBy('Descending order by name');
    const names = await CatalogPage.visibleNames();
    expect(names).toEqual(sortedAsc(names).reverse());
  });

  it('сортировка по цене по возрастанию', async () => {
    await CatalogPage.sortBy('Ascending order by price');
    const prices = await CatalogPage.visiblePrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('сортировка по цене по убыванию', async () => {
    await CatalogPage.sortBy('Descending order by price');
    const prices = await CatalogPage.visiblePrices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });
});
