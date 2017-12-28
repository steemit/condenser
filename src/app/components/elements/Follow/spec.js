import React from "react";
import { mount, shallow } from "enzyme";
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import Follow from "./index";
import rootReducer from 'app/redux/RootReducer';

const store = createStore(rootReducer);

describe("<Follow />", () => {

  const wrapper = shallow(<Provider store={store}><Follow /></Provider>);
  const container = wrapper.instance();

  it("renders without crashing", () => {
    expect(wrapper).toBeTruthy();
    expect(container).toBeTruthy();
    expect(wrapper).toMatchSnapshot();
  });
});