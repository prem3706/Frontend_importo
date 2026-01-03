import React from "react";
import { DotLoader } from 'react-spinners';

export default function Loader() {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center`}>
      
        <DotLoader color="#43804B" size={80} />
     
    </div>
  );
}
