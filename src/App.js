import logo from './logo.svg';
import firebase from "firebase/app";
import './App.css';

import Doge from './comps/doge'

const firebaseConfig = {
  apiKey: "AIzaSyBhQpZxjxYTeJb4SqD7iPgg2lW06ogAJvY",
  authDomain: "doge-b605a.firebaseapp.com",
  projectId: "doge-b605a",
  storageBucket: "doge-b605a.appspot.com",
  messagingSenderId: "615138061180",
  appId: "1:615138061180:web:00589c1613ce57102112f9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

function App() {
  return (
    <div className="App">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header> */}
      <Doge />
    </div>
  );
}

export default App;
