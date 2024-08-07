import react from "react";
import Pdp from "../components/Pdp";
import  {getAvailability, getPriceDetail, getProductDetail} from '../utils/ApiList/axiosapi';
import { useParams } from "react-router-dom";
import NotFound from "../components/NotFound";

import usePdpApiCall from "../customHook/usePdpApiCall";

//import useGetPdpData from "../customHook/useGetPdpData";

const PdpPage = () => {

    const {product_no} = useParams()

    if(!product_no){
        return <NotFound error="roduct not found, check the path"/>
    }

    console.log("product_no",product_no);


    const pdpData = usePdpApiCall(getProductDetail,product_no);
    const priceData= usePdpApiCall(getPriceDetail,product_no);
    const getAvail = usePdpApiCall(getAvailability,product_no);

   console.log("data from pdppage",pdpData);

    return (
        <>
            <Pdp data = {pdpData} price ={priceData} avail = {getAvail} product_no={product_no}/>
        </>
    );
};

export default PdpPage;