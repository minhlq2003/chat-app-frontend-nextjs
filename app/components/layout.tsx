import React, { ReactNode } from "react";
import Sidebar from "./sidebar";
import styles from "../styles/Layout.module.css";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default Layout;
