import { ClientByIDPipe } from './client-by-id.pipe';

describe('ClientByIDPipe', () => {
  it('create an instance', () => {
    const pipe = new ClientByIDPipe();
    expect(pipe).toBeTruthy();
  });
});
