import './style/style.css'
import {Customers} from "./app/Customers";
import {KohortsList} from "./app/Kohorts";
import {useSelector} from "react-redux";
import {Loader} from "./app/Loader";

function App() {
    const customersStatus = useSelector(state => state.customers.status);

  return (
    <div className="App">
        <KohortsList />
        <Customers />
        {
            customersStatus !== 'succeeded' && <Loader />
        }
    </div>
  )
}

export default App
