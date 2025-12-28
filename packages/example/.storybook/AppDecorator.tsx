import { DecoratorFunction, Renderer } from 'storybook/internal/csf';
import Toast from '../src/components/toast';

const AppDecorator: DecoratorFunction<Renderer> = (storyFn) => {
  return (
    <>
      <Toast />
      {storyFn()}
    </>
  );
};

export default AppDecorator;
