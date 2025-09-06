import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Bars3BottomLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Aside from '../../Components/Aside/Aside';
import baseUrl from '../../utils/baseurl';
import ModalInvoice from '../../Components/Modal/ModalInvoice';
import toast, { Toaster } from 'react-hot-toast';
import { setSale } from '../../Redux/sales/saleSlice';

const ViewSales = () => {
  const navigate = useNavigate();
  const isLogin = useSelector((state) => state.login.loginStatus);
  const salesList = useSelector((state) => state.sale.sales);
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");   // 🔍 search state
  const [printInvoiceData, setPrintInvoiceData] = useState({
    "custmrDetails": {
      cust_id: "",
      cust_order_id: "",
      cust_name: "",
      cust_email: "",
      cust_contact: "",
      "cartItems": []
    }
  })

  const getSales = async () => {
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    let requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
      credentials: 'include'
    };

    try {
      const response = await fetch(`${baseUrl}/getsales`, requestOptions);
      const result = await response.json()

      if (result.status) {
        dispatch(setSale(result.data));
      } else {
        console.log('Error::new sales::result', result.message);
      }
    } catch (error) {
      console.log('Error::new sales::', error);
    }
  }

  const handleDelete = async(id) => {
    if (window.confirm("Are u sure to delete?")) {
      let myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      let requestOptions = {
        method: 'POST',
        body: JSON.stringify({ salesId: id }),
        headers: myHeaders,
        redirect: 'follow',
        credentials: 'include'
      };
      try {
        const response = await fetch(`${baseUrl}/deletesales`, requestOptions);
        const result = await response.json();

        if (result.status) {
          toast.success("Delete Success");
          getSales();
        } else {
          toast.error("Something went wrong! try again");
          console.log('Error::new sales::result', result.message);
        }
      } catch (error) {
        console.log('Error::new sales::', error)
      }
    }
  }

  useEffect(() => {
    if (!isLogin) {
      navigate("/login")
    } else {
      if (salesList.length <= 0) {
        getSales()
      }
    }
  }, [])

  // 🔍 filter logic
  const filteredSales = salesList.filter((sale) =>
    sale.cust_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.cust_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.cust_contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='md:w-[80%] md:mx-auto'>
      <div className="drawer lg:drawer-open">
        <input id="sidebar_drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content px-4">
          <div className="flex items-center justify-between ">
            <label htmlFor="sidebar_drawer" className="drawer-button lg:hidden">
              <Bars3BottomLeftIcon className='w-6 h-6' />
            </label>
            <h2 className='text-xl w-full text-center md:text-start'>My Sales</h2>

            {/* 🔍 desktop search bar */}
            <div className='hidden md:flex items-center w-1/2'>
              <input
                type="text"
                placeholder="Search in sales"
                className="input input-bordered rounded-full h-10 lg:w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="button" className='serch p-2 bg-blue-500 text-white rounded-md ms-2'>
                <MagnifyingGlassIcon className='w-6 h-6' />
              </button>
            </div>
          </div>

          {/* 🔍 mobile search bar */}
          <div className='flex md:hidden items-center w-full mt-4'>
            <input
              type="text"
              placeholder="Search in sales"
              className="input input-bordered rounded-full h-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="button" className='serch p-2 bg-blue-500 text-white rounded-md ms-2'>
              <MagnifyingGlassIcon className='w-6 h-6' />
            </button>
          </div>

          {/* table start */}
          {filteredSales.length <= 0 ? (
            <div className='text-sm px-2 text-center'>No Items Found</div>
          ) : (
            <div className='overflow-auto'>
              <table className="table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Cust Name</th>
                    <th>Cust contact</th>
                    <th>Cust email</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filteredSales].reverse().map((elem, inx) => (
                    <tr className="hover" key={inx}>
                      <th>{inx + 1}</th>
                      <td>{elem.cust_name}</td>
                      <td>{elem.cust_contact}</td>
                      <td>{elem.cust_email}</td>
                      <td>
                        <button
                          onClick={() => {
                            setPrintInvoiceData({
                              "custmrDetails": {
                                cust_id: elem._id,
                                cust_order_id: (filteredSales.length - inx),
                                cust_name: elem.cust_name,
                                cust_email: elem.cust_email,
                                cust_contact: elem.cust_contact,
                                "cartItems": elem.cartItems
                              }
                            })
                            document.getElementById("invoice_modal").showModal();
                          }}
                          className='btn btn-sm btn-primary '
                        >
                          print invoice
                        </button>
                        <button
                          onClick={() => { handleDelete(elem._id) }}
                          className='btn btn-sm btn-error ms-2'
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* table end */}
        </div>

        <div className="drawer-side md:h-[80vh] h-full">
          <label htmlFor="sidebar_drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          <Aside />
        </div>
      </div>

      <ModalInvoice id="invoice_modal" title="Download Invoice" InvoiceDetails={printInvoiceData} />
      <Toaster />
    </div>
  )
}

export default ViewSales
