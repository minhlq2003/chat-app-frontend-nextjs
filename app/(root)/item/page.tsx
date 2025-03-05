import Image from "next/image";
import { images } from "@/constant/images";
function Item() {
  return (
    <div>
      <p>Item</p>
      <Image width={50} height={50} alt="" src={images.abc} />
    </div>
  );
}

export default Item;
