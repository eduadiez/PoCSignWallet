import React from "react";
import logo from "./logo.png";
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import Toolbar from "@material-ui/core/Toolbar";

const Header = () => (
  <AppBar position="static" color="default" className="appbar">
    <Toolbar>
      <div className="toolbar">
        <img src={logo} alt="logo" className="logo" />
      </div>
      
      <Button href="https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md">Docs</Button>
    </Toolbar>
  </AppBar>
);

export default Header;