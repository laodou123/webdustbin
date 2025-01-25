import ReactDOM from "react-dom/client";
import './index.css';
import App from './App';
import { App as AntdApp } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <React.StrictMode>
  <StyleProvider hashPriority='high'>
    <AntdApp component={false}>
      <App />
    </AntdApp>
  </StyleProvider>
  // </React.StrictMode>
);

// ReactDOM.render(
//   <StyleProvider hashPriority='high'>
//     <AntdApp component={false}>
//       <App />
//     </AntdApp>
//   </StyleProvider>
//   , document.getElementById("root"));

