import { MemoryRouter } from 'react-router-dom';
import { expect, test } from 'vitest';
import App from '~/components/App/App';
import { server } from '~/mocks/server';
import { http, HttpResponse } from 'msw';
import API_PATHS, { API_PARAMS, API_URL } from '~/constants/apiPaths';
import { CartItem } from '~/models/CartItem';
import { AvailableProduct } from '~/models/Product';
import { renderWithProviders } from '~/testUtils';
import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import { formatAsPrice } from '~/utils/utils';

test('Renders products list', async () => {
  const products: AvailableProduct[] = [
    {
      id: '1',
      title: 'Product 1',
      description: 'Product 1 description',
      price: 1,
      count: 1,
    },
    {
      id: '2',
      title: 'Product 2',
      description: 'Product 2 description',
      price: 2,
      count: 2,
    },
  ];
  server.use(
    http.get(`${API_URL}/products?${API_PARAMS}`, () => {
      return HttpResponse.json<AvailableProduct[]>(products, { status: 200 });
    }),
    http.get(`${API_PATHS.cart}/profile/cart`, () => {
      return HttpResponse.json<CartItem[]>([], { status: 200 });
    }),
  );
  renderWithProviders(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );

  await waitForElementToBeRemoved(() => screen.queryByText(/Loading/));
  products.forEach((product) => {
    expect(screen.getByText(product.title)).toBeInTheDocument();
    expect(screen.getByText(formatAsPrice(product.price))).toBeInTheDocument();
  });
});
