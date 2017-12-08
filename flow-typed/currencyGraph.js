// @flow

declare type ExchangeNode = {
	from: String,
	to: String,
	price: Number
};

declare type ExchangeNodeDict = Map<String, ExchangeNode>;
