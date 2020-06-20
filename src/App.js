import React, { Component } from 'react'
import CssBaseline from "@material-ui/core/CssBaseline";
import Header from "./Header";
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Web3 from 'web3'
import './App.css'
import { PrivateKey } from './eddsa-babyjub';


function createData(name, value) {
  return { name, value };
}

var domain = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" },
  { name: "salt", type: "bytes32" }
];

const domainData = {
  name: "Iden3 Certification Authority",
  version: "1",
  chainId: 1,
  verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
  salt: "0xa222082684812afae4e093416fff16bc218b569abe4db590b6a058e1f2c1cd3e"
};

const signedMsg = [
  { name: "Account", type: "address" },
  { name: "Text to sign", type: "string" },
];

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545")
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    this.setState({ signature: "0" })
    this.signMsg(web3, accounts[0])
  }

  signMsg(web3, from) {
    var msg = {
      Account: from,
      Message: "I want to use your CA service",
    };

    const data = JSON.stringify({
      types: {
        EIP712Domain: domain,
        SignedMsg: signedMsg,
      },
      domain: domainData,
      primaryType: "SignedMsg",
      message: msg
    });
    this.setState({ message: data })

    web3.currentProvider.sendAsync({
      method: 'eth_signTypedData_v3',
      params: [from, data],
      from: from
    }, (err, response) => {
      console.log(data)
      if (err) return console.error(err)
      if (response.error) {
        return console.error(response.error.message)
      }
      var newAccount = web3.eth.accounts.privateKeyToAccount(response.result.substring(0, 66))
      console.log(response.result.substring(67, 131))
      const priv = new PrivateKey(Buffer.from(response.result.substring(67, 99)));

      const pub = priv.public();
      console.log(priv)
      console.log(pub)
      this.setState({
        signature: response.result,
        derived_pb: newAccount.address,
        derived_sk: newAccount.address,
        babyjub_x: pub.p[0].toString(16),
        babyjub_y: pub.p[1].toString(16),
        babyjub_compressed: pub.compress(),
        rows: [
          createData('Signature', response.result),
          createData('ETH1.x derived public key', newAccount.address),
          createData('ETH1.x derived secret key', newAccount.address),
          createData('Babyjub public x', pub.p[0].toString(16)),
          createData('Babyjub public y', pub.p[1].toString(16)),
          createData('Babyjub compressed', pub.compress()),
        ]
      })


    })
  }

  tabRow() {
    return this.state.business.map(function(object, i) {
      return <TableRow obj={object} getBusinessData={this.getBusinessData} key={i} />;
    });
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      message: '',
      signature: '',
      derived_sk: '',
      derived_pb: '',
      babyjub_x: '',
      babyjub_y: '',
      babyjub_compressed: '',
      rows: [
        createData('Signature', ''),
        createData('ETH1.x derived public key', ''),
        createData('ETH1.x derived secret key', ''),
        createData('Babyjub public x', ''),
        createData('Babyjub public y', ''),
        createData('Babyjub compressed', '')
      ],
      classes: makeStyles({
        table: {
          minWidth: 650,
        },
      })
    }

    this.loadBlockchainData = this.loadBlockchainData.bind(this);
  }

  render() {

    return (
      <div className="App">
        <React.Fragment>
          <CssBaseline />
          <Header />
          <main>
            <div className="layout">

              {/* Hero unit */}
              <div className="hero-content">

                <div className="hero-title">
                  Generation of different wallets with ETH1.x signatures
                </div>
                <TableContainer component={Paper}>
                  <Table className={this.state.classes.table} aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Key</TableCell>
                        <TableCell align="right">Value</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {this.state.rows.map((row) => (
                        <TableRow key={row.name}>
                          <TableCell component="th" scope="row">
                            {row.name}
                          </TableCell>
                          <TableCell align="right">{row.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </div>
          </main>
        </React.Fragment>
      </div>
    );
  }
}

export default App;