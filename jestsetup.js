import { configure, shallow } from "enzyme";
import Adapter from "enzyme-adapter-react-15";

configure({ adapter: new Adapter() });

global.shallow = shallow;