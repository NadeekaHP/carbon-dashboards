/*
 *  Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */

import React, {Component} from "react";
import Widget from "@wso2-dashboards/widget";
import VizG from 'react-vizgrammar';
import WidgetChannelManager from './utils/WidgetChannelManager'

class LineChart extends Widget {

    constructor(props) {
        super(props);
        this.queryTemplate = "from requestAggregation within '2018-**-** **:**:**' per 'seconds' select *";
        //"from requestAggregation within '2018-**-** **:**:**' per 'seconds' select *";
        //"from requestAggregation within 1519206720000L,1519301640000L per 'minutes' select *" 
        this.lineConfig = {
            x: 'AGG_TIMESTAMP',
            charts:
                [
                    {
                        type: 'line',
                        y: 'num_requests',
                        fill: '#00e1d6',
                        style:
                            {strokeWidth: 2, markRadius: 3}
                    }
                ],
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
            legend: true,
            animate: true,
            append:false,
            style: {
                legendTitleColor: "#5d6e77",
                legendTextColor: "#5d6e77",
                tickLabelColor: "#5d6e77",
                axisLabelColor: "#5d6e77"
            },
            gridColor: "#5d6e77",
            brush:true,
        };

        this.metadata = {
            names: ['AGG_TIMESTAMP', 'num_requests'],
            types: ['time', 'linear']
        };

        this.aggreagtionData = [
            ['1519034400000', 5],
            ['1519038000000', 8],
            ['1519041600000', 18],
            ['1519045200000', 11],
            ['1519048800000', 16],

        ];

        this.state = {
            data: [],
            metadata: null,
            width: this.props.glContainer.width,
            height: this.props.glContainer.height,
            fromDate: null,
            toDate : null,
            granularity : null,
            query: null
        };

        this.handleResize = this.handleResize.bind(this);
        this.props.glContainer.on('resize', this.handleResize);

        this.channelManager = new WidgetChannelManager();
        this._handleDataReceived = this._handleDataReceived.bind(this);
        this.setReceivedMsg = this.setReceivedMsg.bind(this);
        this.setQuery  = this.setQuery.bind(this);
        this.setGraph = this.setGraph.bind(this);
        this.getProviderConfig = this.getProviderConfig.bind(this);


       this.providerConfigurationSiddhi = {
            siddhiApp:'@App:name("HTTPAnalyticsWithAggregation") @source(type="wso2event", wso2.stream.id="org.wso2.msf4j.analytics.httpmonitoring:1.0.0", @map(type="wso2event")) define stream requestsStream(meta_timestamp long,meta_server_address string,meta_server_name string,meta_application_type string,correlation_activity_id string,correlation_parent_request string,service_class string, service_name string, service_method string, request_uri string, service_context string, http_method string,content_type string, request_content_length  long, referrer string, http_status_code int,response_time long); @store( type="rdbms",jdbc.url="jdbc:mysql://localhost:3306/Aggregation",username="root",password="mysql",jdbc.driver.name="com.mysql.jdbc.Driver") define table ServiceTable( meta_server_address string, service_name string, service_method string); @store(type="rdbms",jdbc.url="jdbc:mysql://localhost:3306/Aggregation",username="root",password="mysql",jdbc.driver.name="com.mysql.jdbc.Driver") define aggregation requestAggregation from requestsStream select count() as num_requests, avg(response_time) as avg_response_time group by meta_server_address, service_name, service_method, http_status_code aggregate by meta_timestamp every sec...year;from requestsStream#window.unique:first(meta_server_address,service_name,service_method) select meta_server_address,service_name,service_method insert into UniqueService; from UniqueService select * insert into ServiceTable;',
            query: this.queryTemplate,
            publishingInterval: '5'
            //from requestAggregation within '2018-**-** **:**:**' per 'seconds' select *
            //from requestAggregation within '2018-02-21 15:25:30','2018-02-21 15:25:40' per 'seconds' select *
         };

        this.providerConfigSiddhi = {
            configs: {
                type: 'SiddhiStoreDataProvider',
                config: this.providerConfigurationSiddhi
            }
        };
        //console.log(querTemplate)

    }

    getProviderConfig(){
        var A = {
            siddhiApp:'@App:name("HTTPAnalyticsWithAggregation") @source(type="wso2event", wso2.stream.id="org.wso2.msf4j.analytics.httpmonitoring:1.0.0", @map(type="wso2event")) define stream requestsStream(meta_timestamp long,meta_server_address string,meta_server_name string,meta_application_type string,correlation_activity_id string,correlation_parent_request string,service_class string, service_name string, service_method string, request_uri string, service_context string, http_method string,content_type string, request_content_length  long, referrer string, http_status_code int,response_time long); @store( type="rdbms",jdbc.url="jdbc:mysql://localhost:3306/Aggregation",username="root",password="mysql",jdbc.driver.name="com.mysql.jdbc.Driver") define table ServiceTable( meta_server_address string, service_name string, service_method string); @store(type="rdbms",jdbc.url="jdbc:mysql://localhost:3306/Aggregation",username="root",password="mysql",jdbc.driver.name="com.mysql.jdbc.Driver") define aggregation requestAggregation from requestsStream select count() as num_requests, avg(response_time) as avg_response_time group by meta_server_address, service_name, service_method, http_status_code aggregate by meta_timestamp every sec...year;from requestsStream#window.unique:first(meta_server_address,service_name,service_method) select meta_server_address,service_name,service_method insert into UniqueService; from UniqueService select * insert into ServiceTable;',
            query: this.queryTemplate,
            publishingInterval: '5'
            //from requestAggregation within '2018-**-** **:**:**' per 'seconds' select *
            //from requestAggregation within '2018-02-21 15:25:30','2018-02-21 15:25:40' per 'seconds' select *
        };  

        var b =          {
            configs: {
                type: 'SiddhiStoreDataProvider',
                config: A
            }
        };
        return b;
       
    }

    handleResize() {
        this.setState({width: this.props.glContainer.width, height: this.props.glContainer.height});
        //console.log(querTemplate)
    }

    componentDidMount() {
        this.channelManager.subscribeWidget(this.props.id, this._handleDataReceived, this.getProviderConfig());
        super.subscribe(this.setReceivedMsg);
    }

    componentWillUnmount() {
        this.channelManager.unsubscribeWidget(this.props.id);
    }

    _handleDataReceived(data) {
        //console.log("message");
        console.log(data);
        //console.log("*****handle data received call**************")
        this.setState({
            //metadata: this.metadata,
            metadata: data.metadata,
            data: data.data
        });
        window.dispatchEvent(new Event('resize'));
    }

    setReceivedMsg(receivedMsg) {
        //console.log("....................");
        //console.log(receivedMsg);
        var str = receivedMsg.split("_");
        this.setState({
            fromDate:str[0],
            toDate: str[1],
            granularity : str[2]
        },this.setQuery);    
    }

    setQuery(){
        //console.log("...........setQuery method call........")
        this.queryTemplate = "from requestAggregation within " + this.state.fromDate + "L," + this.state.toDate +"L per '"+ this.state.granularity +"s' select *" ;
        //this.providerConfigurationSiddhi.query =  this.queryTemplate;
        //this.queryTemplate = "from requestAggregation within 1519206930000L,1519206940000L per 'seconds' select *";
        console.log("before "+this.queryTemplate);
        this.setGraph();
        //return this.queryTemplate;
    }

    setGraph(){
        console.log("...........setGraph method call........")
       
        this.channelManager.unsubscribeWidget(this.props.id);
        //this.channelManager = new WidgetChannelManager();
        console.log(this.getProviderConfig())
        this.channelManager.subscribeWidget(this.props.id, this._handleDataReceived, this.getProviderConfig());
        console.log(this.props.id);
        console.log("after "+this.queryTemplate)
    }

    render() {
        //console.log(this.props.id);
        //console.log(this.getProviderConfig())
        return (
            <div
                style={{
                    marginTop: "5px",
                    width: this.props.glContainer.width,
                    height: this.props.glContainer.height,
                }}
            >
                <VizG
                    config={this.lineConfig}
                    metadata={this.metadata}
                    data={ this.state.data}
                    height={this.props.glContainer.height}
                    width={this.props.glContainer.width}
                />
            </div>
        );
    }
}


global.dashboard.registerWidget("LineChart", LineChart);

