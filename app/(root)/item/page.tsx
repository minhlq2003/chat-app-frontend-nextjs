"use client";

import { images } from "@/constant/images";
import Image from "next/image";

function Item() {
  return (
    <div>
      <p>Item</p>
      <Image width={50} height={50} alt="" src={images.abc} />
    </div>
  );
}

export default Item;
