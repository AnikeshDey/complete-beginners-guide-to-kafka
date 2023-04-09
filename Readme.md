# Complete Beginners Guide to Apache Kafka 


## APACHE KAFKA Basics

Apache Kafka is distributed publish-subscribe messaging system

Broker is where the producer appends the message and consumer gets the messages from

Producer --> Broker --> Consumer

Multiple producers are able to simultaneously and asynchronously produce messages into a broker and Multiple consumers are able to simultaneously and asynchronously read messages from a broker

If we store messages in a single broker it's not very reliable that's why we create broker cluster with small amount of brokers which can be scaled later

multiple producers sends message to the same cluster and multiple brokers distribute that message in parts and stores it

multiple consumers read message from the same cluster and the cluster sends the different parts of the message saved in different brokers

If one of the broker fails other brokers will take over and continue the operation of a Kafka cluster  

If there are multiple brokers inside a cluster it becomes very unclear how they maintain state of entire cluster and how they communicate between each other and thats where zookeeper comes in

Apache kafka server won't even start without the apache zookeeper and thats why zookeeper is a mandatory for the kafka ecosystem

**Main responsibilities of zookeeper**

    1. Maintains list of active brokers - At any moment of time the zookeeper knows which brokers are active and which brokers have failed

    2. Elects Controller - Elects controller among all brokers in a cluster, one cluster can have only one broker as controller

    3. Manages topics and partitions in a cluster - When you create any topic in a kafka cluster it is basically created in the zookeeper and then the zookeeper distributes this configuration in all brokers in a cluster

If cluster of the brokers is very very large then it's not safe to have only one zookeeper that's why cluster of zookeepers is created and it is called zookeeper ensemble

It is reccomended to have odd number of servers in zookeeper ensemble

Quarum is the minimum server that should be up and running in order to form operational cluster otherwise if there are less zookeepers than quarum then the zookeeper cluster is considered down and all the corresponding brokers connected to that cluster will also be down

It is recommended to have odd number of servers in the zookeeper ensemble like 1,3,5,7 etc and quorum set to (n+1)/2 where n is qty of servers (like for 9 servers the quorum should be (9 + 1)/2 = 5)

If your company is large and it is spread accross the world it is really nice idea to create multiple clusters in different countries and continents 

Each cluster will be a separate entity with own brokers and producers and consumers also zookeeper is needed in every cluster and you can create as many clusters as you need 

Sync is possible between two clusters maybe one in usa and one in europe

For example there are two clusters one in the us and other in europe and producers closer to the cluster in us will produce messages to that cluster after that those messages will be synced to the cluster in europe and if there is some consumer located in europe it will connect to the closest cluster in europe in that case message that was produced in a cluster will be read from a different cluster thanks to the mirroring of the clusters and of course such separation of two different clusters will reduce total load and will increase efficiency

_Default port for zookeeper localhost:2181_
_Default port for kafka server (broker) localhost:9092_

If you want to use multiple zookeeper servers on a same computer you need to run it on different ports, If you want to run 3 zookeeper servers you should make separate config files with different ports and log files for different servers.

It is possible to run multiple kafka brokers on a single computer we just have to make separate config files with different ports and also you should adjust folders where each broker will store their messages or logs

If you're running zookeeper or kafka broker on different computers you can use same ports

If Brokers should be publicly accessible you need to adjust "advertised.listeners" property in Broker config

Every message is stored inside a special entity called topic

Every topic must have an unique name

Every topic has an unique topicId by default

Every message has it's unique number called offset and this number is added to every message when it arrives to a specific broker

When times go by every producer message will be appended to the end of the topic log

Every number and every log message is immutable that means you cannot change or delete a message, by default every message will be deleted after the log retention period which is 168 hours(7 days) which can be changed

**Message Structure**

    1. Timestamp - Every message has timestamp and this timestamp can be assigned by the producer or kafka broker, it is configurable

    2. Offset number - Every message has an offset number and the number must be unique across partition in specific topic

    3. Key - Keys are optional which are used as optional grouping machanism to store messages in a topic, keys are created by the users and they are sent to kafka brokers if several messages have the same key they will be sent to the same partition in a topic

    4. Value - Value of every message is simply sequenced bytes, apache kafka doesn't care what type of data you store as long as it is sequence of bytes it means you can store any type of data encoded as bytes remmember that the purpose of apache kafka is to send small chunks of data, so try to keep messages as small and simple as possible to achieve maximum efficiency of an apache cluster

Every topic can be stored on different brokers that are included in a kafka cluster

We create topic on different brokers for fault tolerance if one of the brokers fail then others can serve the same message

Messages are spread across different brokers when same topic is present on different brokers for that kafka uses partitions

If messages are stored in different partitions across different brokers then the write and read operation becomes much faster

If topic "cities" is created with default configuration (single partition), Broker will create a folder cities-0 for single partition

Every partition must have unique message offset but offset number across the partition should not be unique, messages can have same offset number if allocated in different partitions

Producers can write messages to different partitions, every producer decides to which partition to write the message on, and the message will be appended after the last message in that partition

Using multiple partitions we achieve paralel performance of writing and reading operations

If messages in partition 1 broker 1 fails the messages will be lost and you won't be able to consume those messages anymore for that you can replicate messages in multiple partitions

Leader and Follower Partition - In replication of messages there can be multiple partitions across multiple brokers there must be a partition which is the leader partition and other partitions are created as followers. Leader partitions recieve write and read request from producers and consumers and the job of followers partitions is to get new messages from the leader and write it into specific partition they don't accept any write permission from producers and read permission from consumers

When leader partition gets message to write it writes it into that specific partition and replicates that message in the follower partitions, main idea behind this application is that leader performs most operations and sends copies of every message to all followers.

It is recommended to create atleast two replicas, if you want to create two copies of every message you need to have at least three brokers and you need to configure a so-called replication factor on a topic level

If you want to achieve such architecture where every message from a leader will be replicated twice the Replication Factor must be set to 3 which is a recommended number for production environment and you should not go further

Controller - One of the brokers serves ass the controller, which is responsible for managing the states of partitions (Leader or Follower) and replicas and for performing administrative tasks like reassigning partitions. Zookeeper ellects the controller from the brokers and if that broker fails another broker will be ellected as controller by zookeeper 

In case you use Kafka brokers and zookeeper remotely on any of the hosting services like Amazon EC2, Google Cloud or Digitalocean and want to connect to it from your local computer (produce or consume messages) you need to do following:

    1. On hosting service firewall allow remote access and open ports 2181 (Zookeeper) and 9092 (Broker)

    2. In the configuration file for each broker you need to adjust  advertised.listeners and set it either to DNS name or public IP address of the server where broker is hosted


## APACHE KAFKA Basic Operations

Start the ZOOKEEPER server

```shell
bin/zookeeper-server-start.sh config/zookeeper.properties
```

Start the KAFKA server

```shell
bin/kafka-server-start.sh config/server.properties
```

Create a topic named cities

```shell
bin/kafka-topics.sh --create --bootstrap-server localhost:9092 --topic cities
```
List all topics in kafka cluster

```shell
bin/kafka-topics.sh --list --bootstrap-server localhost:9092
```

Describe the topic cities

```shell
bin/kafka-topics.sh --describe --bootstrap-server localhost:9092 --topic cities
```

Produce messages in topic cities in kafka cluster

```shell
bin/kafka-console-producer.sh --broker-list localhost:9092 --topic cities
```
> Press Enter -> Open Prompt -> Type messages -> Press Enter to save in cluster

Consume only the currently added messages from the topic cities

```shell
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic cities
```

Consume all the messages from the topic cities and the currently added ones too
```shell
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic cities --from-beginning
```

Kafka cluster stores messages even if they were already consumed by one of the consumers

Multiple consumers and Multiple producers could exchange messages via single centralized storage point - kafka-cluster

Producers and consumers don't know about each other

Producers and consumers may appear and disappear. But kafka doesn't care about that.

It's job is to store messages and recieve or send them on demand

Producers send messages to the kafka cluster

Consumers recieve messages from the kafka cluster

Every consumer must be part of the consumer group

After we send messages to kafka cluster it saves it in `/tmp/kafka-logs/:topicname/.log` file

Every message inside of the topic has unique number called "Offset"

First message in each topic has offset 0

Consumers can start reading messages starting from specific offset

Kafka doesn't store all messages forever and after specific amount of time or when size of the log exceeds configured max size messages are deleted

_Default log retention period is 7 days (168 hours)_

Create a topic named animals with multiple partitions

```shell
bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --replication-factor 1 --partitions 3 --topic animals
```

Consume all messages from a specific partition in the topic animals

```shell
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --partition 1 --topic animals --from-beginning
```

Consume messages from a specific partition starting from a specific offset

```shell
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --partition 1 --topic animals --offset 0
```
__consumer_offsets - Inside of it kafka stores commited offsets of consumers, like after the previous command kafka knows that one comsumer has read message from animals topic partition 1 and offset of 0, this information is stored in one of fifty partitions of __consumer_offset

If you want to create multiple brokers then you need to make multiple configuration files in the config folder with -
    1. Unique port
    2. Unique broker ID
    3. Unique log directory

Like if you want to create three brokers get into the config folder and make three copies of the server.properties file named server0.properties, server1.properties, server2.properties and change broker.id and listeners and log.dirs in every file

Now run the `bin/kafka-server-start.sh` with three different properties file

Get Ids of active brokers from zookeeper

```shell
bin/zookeeper-shell.sh localhost:2181 ls /brokers/ids
```

Get information about a specific broker from zookeeper

```shell
bin/zookeeper-shell.sh localhost:2181 get /brokers/ids/0
```

Create a topic named cars with multiple partitions and brokers

```shell
bin/kafka-topics.sh --bootstrap-server localhost:9092,localhost:9093,localhost:9094 --create --replication-factor 1 --partitions 5 --topic cars
```

Produce messages in all brokers and cars topic 

```shell
bin/kafka-console-producer.sh --broker-list localhost:9092,localhost:9093,localhost:9094 --topic cars
```

Consume messages from all brokers and cars topic

```shell
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092,localhost:9093,localhost:9094 --topic cars
```

List all topics in kafka brokers

```shell
bin/kafka-topics.sh --list --bootstrap-server localhost:9092,localhost:9093,localhost:9094
```

Describe the topic cars from all brokers

```shell
bin/kafka-topics.sh --describe --bootstrap-server localhost:9092,localhost:9093,localhost:9094 --topic cars
```

Without replication if one broker stops messages of that broker's partitions will be lost

Create a topic named months with multiple partitions and brokers and replications

```shell
bin/kafka-topics.sh --bootstrap-server localhost:9092,localhost:9093,localhost:9094 --create --replication-factor 3 --partitions 7 --topic months
```

List all consumer groups

```shell
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --list
```

Get details about a spefic consumer group

```shell
bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --group console-consumer-34343 --describe
```

Let's imagine there is some topic with multiple producers who send messages to it at very high rates, Single consumer may not be able to consume all produced messages at the same high rates that's why consumers may be organized into consumer groups to share consumtion of the messages

You can see list and details of consumer groups but you cannot delete one, Consumer group is automatically deleted when the last committed offset for the group expires (offsets.retention.minutes - default 24 hours)

Start consumption with custom consumer group

```shell
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic numbers --group numbers-group --from-beginning
```

LAG will be non-zero if `CURRENT-OFFSET` is less than `LOG-END-OFFSET`, It means that "Consumer has not yet consumed all messages in the partition"

If there are more consumers in consumer group than partitions - some of the consumers will be idle (not recieve any messages)

Producer Performance Test

```shell
bin/kafka-producer-perf-test.sh --topic perf --num-records 1000 --throughput 100 --record-size 1000 --producer-props bootstrap.servers=localhost:9092
```

Consumer Performance test 

```shell
bin/kafka-consumer-perf-test.sh --broker-list localhost:9092 --topic perf --messages 10000
```

If consumer consumes slowly than producers produce there will be LAG between offsets

Kafka stores the offsets at which a consumer group has been reading

The offsets committed live in a kafka topic named `__consumer_offsets`

When a consumer in a group has proccessed data recieved from kafka, it should be commiting the offsets

If a consumer dies, it will be able read back from where it left of thanks to the committed consumer offsets!