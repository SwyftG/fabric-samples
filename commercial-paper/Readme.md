# Blocckchain BookstoreApp

BookstoreApp is modified from comericial_paper example of HyperLedger Fabric. The Bookstore role is to `ISSUE` and `PUBLISH` the digit book. The customer role can `BUY` and `RETURN` the digit book. Both roles can have access to read book if they own the book.

### Project Structure

Under `organization` folder, there are three organizations:`bookstore`, `digibank` and `magnetocorp`. In BookstoreApp, I only use bookstore and digibank those two organizations. 

`isabella` is the owner of bookstore, `balaji` and `tom` are two customers who buy digit books from bookstore. Those two people are belong to digibank organization. Because under the `/fabric-samples/basic-network/crypto-config/peerOrganizations/org1.example.com/users/` folder, there are only two users, `Admin@org1.example.com` and `User1@org1.example.com`. So here at digibank organization, balaji and tom they have differetn watllet, but they are in the same organization.

Under `/organization/bookstore/application/` folder, those are actions for bookstore role:
 - `addToWallet` add Isabella's wallet to file system.
 - `issue` issue the digit book to the whole network.
 - `publish` publish the issued digit book, so that the book can be selled.
 - `read` read the content of book.
 - `query` query the digit book, show its info.


Under `/organization/digitbank/application/` folder, those are actions for customer who can buy and return digit books:
 - `addBalajiToWallet` add Balaji's wallet to file system.
 - `addTomToWallet` add Tom's wallet to file system.
 - `buyBalaji` Balaji buys digit book from bookstore.
 - `buyTom` Tom buys digit book from bookstore.
 - `buyTomPoor` Tom does not have enought money to buy the book.
 - `returnBalaji` Balaji return the bought digit book back to the bookstore.
 - `returnTom` Tom return the bought digit book back to the bookstore.
 - `readBalaji` Balaji read the content of book if he bought it.
 - `readTom` Tom read the content of book if he bought it.
 - `query` query the digit book, show its info.

Under `/organization/bookstore/contract/lib/` folder, here is the digit contract placed.
 - `book` digit book is here
 - `bookcontract` this is smart contract for Hyperledger Fabric.
 - 'booklist' the meaning is as its name.

### DigitBookContracter

The smart contract in Bookstroe basic_net is called DigitBookContract. The basic unit is DigitBook, which has six states: 
 - `UNPUBLISHED`, after book be issued by bookstore. Book is not avaiable to be selled.
 - `PUBLISHED`, after publishing, the book can be transformed between bookstore and  customers.
 - `TRADING`, middle state between PUBLISH and SELLED. It's like a lock state.
 - `SELLED`, customer has bought digit book.
 - `RETURNING`, middle state between SELLED and RETURNED. Lock state.
 - `RETURNED`, means book has been returned to bookstore.

For bookstore, every book in bookstore should be issued first. If bookstore owner want to trade book, he or she should publish book whatever the book's state is UNPUBLISHED or RETURNED. UNPUBLISHED means the book is newly issued. RETURNED means the book has been traded before. The bookstore owner has access to read the book if the book's state is PUBLISHED, UNPUBLISHED and RETURNED.

For buyer, they only can buy the book which state is PUBLISHED. Becuase those PUBLISHED books are ready to trade in bookstore. After they buy book successfully, they can access to read the book. Because the owner of the book has changed to be them. The buyer also have right to return the book to the bookstore if they want to. After they returned, they will lose the read access.

### Environment

I have deployed the BookstoreApp on my Tencent Clound EC2. 

IP addrss: 140.143.9.16

Root Password: In the email.

After login EC2 as root, first should add node to PATH by `source nvm/nvm.sh`. Then the envirnment of my EC2 is below.

```
[root@VM_0_10_centos ~]# node -v
v10.15.3
[root@VM_0_10_centos ~]# uname -a
Linux VM_0_10_centos 3.10.0-693.el7.x86_64 #1 SMP Tue Aug 22 21:09:27 UTC 2017 x86_64 x86_64 x86_64 GNU/Linux
[root@VM_0_10_centos ~]# docker -v
Docker version 18.09.6, build 481bc77156
```

The Hyperledger Fabirc Sample is located in directory `/root/dev/go/src/github.com/hyperledger/fabric-samples/`.

If you first start the project, should go to `/fabric-samples/basic-network/` to start the basic_net by following command: `. start.sh`.

![start.sh](https://raw.githubusercontent.com/SwyftG/fabric-samples/release-1.4/commercial-paper/screenshot/001.png)

![dockr ps](https://raw.githubusercontent.com/SwyftG/fabric-samples/release-1.4/commercial-paper/screenshot/002.png)
Then `cd /fabric-samples/commercial-paper/organization/bookstore/configuration/cli/` folder, `docker-compose` cliDigitbook by following command: `docker-compose -f docker-compose.yml up -d cliBookStore`.

![docker-compose -f docker-compose.yml up -d cliBookStore](https://raw.githubusercontent.com/SwyftG/fabric-samples/release-1.4/commercial-paper/screenshot/003.png)

Open a new terminal, log in EC2 and go to same directory as `/fabric-samples/commercial-paper/organization/bookstore/configuration/cli/`, use following command `./monitordocker.sh net_basic ` to start a new docker image to monionter basic_net.

![. monitor](004)

![docker ps](005)

Back to Bookstore terminal, use command `docker exec cliBookStore peer chaincode install -n bookcontract -v 0 -p /opt/gopath/src/github.com/contract -l node` to install `bookcontract` on chaincode peer.

![docker exec cliBookStore peer chaincode install -n bookcontract -v 0 -p /opt/gopath/src/github.com/contract -l node](006)

Use command `docker exec cliBookStore peer chaincode instantiate -n bookcontract -v 0 -l node -c '{"Args":["org.papernet.digitbook:instantiate"]}' -C mychannel -P "AND ('Org1MSP.member')"` to instantiate bookcontract to the whole net. 

![docker exec cliBookStore peer chaincode instantiate ...](007)

Open another terminal, go to DigiBank directary, `/fabric-samples/commercial-paper/organization/digibank/configuration/cli/`, use followed command to start cliDigiBank: `docker-compose -f docker-compose.yml up -d cliDigiBank`.

![docker-compose -f docker-compose.yml up -d cliDigiBank](008)

### Scenarios

#### BookStore

In the BookStore terminal, our star is Isabella, application direction is `/fabric-samples/commercial-paper/organization/bookstore/application/`.

Isabella is the owner of TokyoBookstore. In our BookstoreApp, her first thing is to addToWallet.

![Isabella add wallet](009)

Then she issued the book *LEARNING JAPANESE* as bookNumber *00001* on the net.

![issued digit book](010)

Right now, `query` the book info:

![query the book](011)

After she issued the book, she can access to read it.

![read the book](012)

If she want to sell the book, she has to publish the book.

![publish the book](013)

After the book published, it is ready to be selled. But right now, Tom amd Balaji, who are from DigiBank, have no right to read the book. Because the book is owned by the bookstore.

![Tom and Balaji have no right to read the book](014)

#### DigiBank

Open another terminal as DigiBank

Tom and Balaji are in DigiBank. They have different wallet address. Let's see the addTomToWallet and addBalajiToWallet.

![addTomToWallet](015) 

After they add wallets to the net, they can purchase the book. Let Balaji buy the book.

![Balaji buy the book from bookstore](016)

Query the book, check its state now:

![query book](017)

Right now the book is belonged to Balaji, he has right to read the book, while Tom does not.

![Balaji access to read book](018) 

![Tom can't access to read book](019) 

Because the book's state is SELLED, Tom can not purchased the SELLED book.

![Tom can't purchase the selled book](020)

Also the book is belonged to Balaji, Tom can not return it to BookStore. Bcause he is not the owner.

![Tom can't return the book](021)

The book's owner is Balaji, so Balaji can return the book to bookstore.

![Balaji return book](022)

After Balajir returned book, he lose the right to read the book.

![Balaji lose right to read book](023)

Now the book is owned by bookstore, its state is RETURNED. RETURNED book can not be selled. To sell it, the book needs to be published by bookstore's owner.

![Balaji can not buy the RETURNED book](024)

#### back to Bookstore

Bcause the book is returned, bookstore owner can access to read RETURNED book.

![Bookstore read RETURNED book](025)

Owner can publish book again to be sell it.

![Publish the book again](026)

Let's see what happend when Tom does not have enough money to buy the book.

![Tom does not have evnough money](027)

Right now, the whole lifecycle of the digit book has been finished. There are a lot improvable place in this proces, like issue and publish mutiple books, implement floating prices, every book can be reselled etc.

### Answer for Question

#### 1. Please create a method to prevent anyone other than the purchaser from redeeming the commercial paper.

In `/contract/lib/bookcontract.js` file, there is a `return()` method implemented this function.
```
/**
     * return digit book
     *
     * @param {Context} ctx the transaction context
     * @param {String} bookStore digit book should be returned to
     * @param {String} bookNumber book number
     * @param {String} bookName name of book
     * @param {String} returnOwner who return the book
    */
    async return(ctx, bookStore, bookNumber, bookName, returnOwner) {

        let bookKey = DigitBook.makeKey([bookNumber, bookName]);
        let book = await ctx.bookList.getBook(bookKey);

        // Check paper is not RETURNED
        if (book.isReturned()) {
            throw new Error('Book ' + bookNumber + bookName + ' already returned.');
        }

        // Verify that the return owns the digit book before return it
        if (book.getBookStore() !== bookStore) {
            throw new Error('Book ' + bookNumber + bookName + ' is not buyed from bookStore: ' + bookStore);
        }

        // Change the book's state
        if (book.isSelled()) {
            book.setReturing();
        } else {
            throw new Error('Book ' + bookNumber + bookName + ' state is not seled: ' + book.getCurrentState());
        }

        if (book.isReturning()) {
            if (book.getOwner() === returnOwner) {
                 book.setOwner(book.getBookStore());
                 book.setReturned();
            } else {
                throw new Error('Return owner '+ returnOwner + ' does not own book ' + bookNumber + bookName);
            }
        }

        await ctx.bookList.updateBook(book);
        return book.toBuffer();
    }
```

#### 2. Submit any corections needed to make paperNet work practically in multiple organizations.

Step one: should add crypto-config  in dicrection `/fabic-sample/basic-network/crypto-config/`. We need multiple CA files and pem files. The needed file we could check the example under directary `/peerOrgiations/org1.example.com/users/User1@org1.example.com/`

![/peerOrgiations/org1.example.com/users/User1@org1.example.com/](028)

Step two: modify `/organization/<orgainization name>/gateway/papernetConnection.yaml` file. Modify or add new organization in here. Modify `channels:<chanel name>:peers:`, `organizations: xxxxxx` fileds.

Step three: modify `/organization/xxxxxx/application/addToWallet.js` file. Add correct identity and certification config into wallet file. Make sure that the contract and application function could work correctly.

#### 3. In order use Kafka/ zookeeper in the orderer. How to do it.

1. The number of node in Kafka should be 4.

2. 2the number of node of zookeeper will eigher be 3,5,7. It has be an odd number.

3. Orderers: Encode the Kafka-related information in the network’s genesis block. If you are using configtxgen, then should edit configx.yaml. Otherwise, pick a preset profile for the cyctem channels genesis block.  `Order.OrderType` set to kafka; `Orderer.Kafka.Brokers` contains the address of at least two of the Kafka brokers in cluster in IP:port notation. This list does not need to exhaustive.

4. Orders: Set maximun block size `Order.AbsoluteMaxBytes` in `configtx.yaml`.

5. Orders: create the genesis block, using `configtxgen`.

6. Kafka cluster: set `unclean.leader.election.enable = false`, `default.replication.factor = N`, where N is less then the number of kafka node.

7. Orderers: Point each OSN to the genesis block. Edit General.GenesisFile in orderer.yaml so that it points to the genesis block.

8. Orderers: Adjust polling intervals and timeouts. 

9. Set up the OSNs and Kafka cluster so that they communicate over SSL. Set the keys under Kafka.TLS in orderer.yaml on every OSN accordingly.

10. At last, bring up the nodes in the following order: ZooKeeper ensemble, Kafka cluster, ordering service nodes.

Reference of this question: https://hyperledger-fabric.readthedocs.io/en/release-1.4/kafka.html

#### 4. Using Raft in Order.

In `configtx.yaml` file, shows three Raft nodes in the channel:
```
Consenters:
    - Host: raft0.example.com
      Port: 7050
      ClientTLSCert: path/to/ClientTLSCert0
      ServerTLSCert: path/to/ServerTLSCert0
    - Host: raft1.example.com
      Port: 7050
      ClientTLSCert: path/to/ClientTLSCert1
      ServerTLSCert: path/to/ServerTLSCert1
    - Host: raft2.example.com
      Port: 7050
      ClientTLSCert: path/to/ClientTLSCert2
      ServerTLSCert: path/to/ServerTLSCert2
```

Local configuration:

The `orderer.yaml` has two configuration sections that are relevant for Raft orderers: cluster adn consensus.

Cluster parameters:
- ClientCertificate, ClientPrivateKey: If you wish to use a different TLS client certificate key pair (otherwise, the certificate key pair is taken from the general TLS section.
- ListenPort: The port the cluster listens on. If blank, the port is the same port as the orderer general port.
- ListenAddress: The address the cluster service is listening on.
- ServerCertificate, ServerPrivateKey: The TLS server certificate key pair which is used when the cluster service is running on a separate gRPC server.
- SendBufferSize: Regulates the number of messages in the egress buffer.

Below are hidden configuration parameters for `general.cluster`:
- DialTimeout, RPCTimeout: Specify the timeouts of creating connections and establishing streams.
- ReplicationBufferSize: the maximum number of bytes that can be allocated for each in-memory buffer used for block replication from other cluster nodes. Each channel has its own memory buffer. Defaults to 20971520 which is 20MB.
- PullTimeout: the maximum duration the ordering node will wait for a block to be received before it aborts. Defaults to five seconds.
- ReplicationRetryTimeout: The maximum duration the ordering node will wait between two consecutive attempts. Defaults to five seconds.
- ReplicationBackgroundRefreshInterval: the time between two consecutive attempts to replicate existing channels that this node was added to, or channels that this node failed to replicate in the past. Defaults to five minutes.

Consensus parameters:

- WALDir: the location at which Write Ahead Logs for etcd/raft are stored. Each channel will have its own subdirectory named after the channel ID.
- SnapDir: specifies the location at which snapshots for etcd/raft are stored. Each channel will have its own subdirectory named after the channel ID.

Hidden configuration parameter in `orderer.yaml`:

- EvictionSuspicion: The cumulative period of time of channel eviction suspicion that triggers the node to pull blocks from other nodes and see if it has been evicted from the channel in order to confirm its suspicion. 

Channel configuration:

Here we should focus on `SnapshotIntervalSize`, which can be adjusted at runtime.
- TickInterval: The time interval between two Node.Tick invocations.
- ElectionTick: The number of Node.Tick invocations that must pass between elections. That is, if a follower does not receive any message from the leader of current term before ElectionTick has elapsed, it will become candidate and start an election.
- ElectionTick must be greater than HeartbeatTick.
- HeartbeatTick: The number of Node.Tick invocations that must pass between heartbeats. That is, a leader sends heartbeat messages to maintain its leadership every HeartbeatTick ticks.
- MaxInflightBlocks: Limits the max number of in-flight append blocks during optimistic replication phase.
- SnapshotIntervalSize: Defines number of bytes per which a snapshot is taken.

Reconfiguration step:
  1. Adding the TLS certificates of the new node to the channel through a channel configuration update transaction. 
  2. Fetching the latest config block of the system channel from an orderer node that’s part of the system channel.
  3. Ensuring that the node that will be added is part of the system channel by checking that the config block that was fetched includes the certificate of (soon to be) added node.
  4. Starting the new Raft node with the path to the config block in the General.GenesisFile configuration parameter.
  5. Waiting for the Raft node to replicate the blocks from existing nodes for all channels its certificates have been added to. After this step has been completed, the node begins servicing the channel.
  6. Adding the endpoint of the newly added Raft node to the channel configuration of all channels.

Removing a node from a Raft cluster is done by:

1. Removing its endpoint from the channel config for all channels, including the system channel controlled by the orderer admins.
2. Removing its entry (identified by its certificates) from the channel configuration for all channels. Again, this includes the system channel.
3. Shut down the node.

Reference of this question: https://hyperledger-fabric.readthedocs.io/en/release-1.4/raft_configuration.html#