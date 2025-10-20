import { render } from '@testing-library/react';
import { WelcomeToast } from '../components/welcome-toast';

describe('WelcomeToast', () => {
  it('renders without crashing', () => {
    const { container } = render(<WelcomeToast />);
    expect(container.firstChild).toBeNull();
  });
});