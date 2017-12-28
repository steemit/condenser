import React from "react";
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import Author from "./Index";
import rootReducer from 'app/redux/RootReducer';

const store = createStore(rootReducer);

describe("<Author />", () => {

  const wrapper = shallow(<Provider store={store}><Author /></Provider>);
  const container = wrapper.instance();

  it("renders without crashing", () => {
    expect(wrapper).toBeTruthy();
    expect(container).toBeTruthy();
    expect(wrapper).toMatchSnapshot();
  });
});