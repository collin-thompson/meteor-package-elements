/**
Template Controllers

@module Templates
*/

/**
The select gas price template

@class [template] dapp_selectGasPrice
@constructor
*/

/**
The the factor by which the gas price should be changeable.

@property toPowerFactor
*/
var toPowerFactor = 1.1;


/**
The gas price at start, if non is available

@property defaultGasPrice
*/
var defaultGasPrice = '50000000000';

/**
Calculates the gas * gas price.

@method calculateGasInWei
@return {Number}
*/
var calculateGasInWei = function(template, gas, gasPrice, unit, returnGasPrice){
    // console.log('Estimated gas: ', gas);
    var suggestedGasPrice = web3.fromWei(new BigNumber(String(gasPrice || defaultGasPrice), 10), unit || LocalStore.get('dapp_etherUnit'));

    return (returnGasPrice)
        ? suggestedGasPrice.times(new BigNumber(toPowerFactor).toPower(TemplateVar.get(template, 'feeMultiplicator')))
        : suggestedGasPrice.times(gas).times(new BigNumber(toPowerFactor).toPower(TemplateVar.get(template, 'feeMultiplicator')));
}

Template['dapp_selectGasPrice'].onCreated(function(){
    TemplateVar.set('gasInWei', '0');
    TemplateVar.set('gasPrice', '0');
    TemplateVar.set('feeMultiplicator', 0);
});


Template['dapp_selectGasPrice'].helpers({
    /**
    Return the currently selected fee value calculate with gas price

    @method (fee)
    */
    'fee': function(){
        if(_.isFinite(TemplateVar.get('feeMultiplicator')) && _.isFinite(this.gas) && _.isFinite(this.gasPrice))
            // set the value
            TemplateVar.set('gasInWei', calculateGasInWei(Template.instance(), this.gas, this.gasPrice, 'wei').floor().toString(10));
            TemplateVar.set('gasPrice', calculateGasInWei(Template.instance(), this.gas, this.gasPrice, 'wei', true).floor().toString(10));

            // return the fee
            return EthTools.formatNumber(calculateGasInWei(Template.instance(), this.gas, this.gasPrice, this.unit).toString(10), '0,0.[00000000]');
    },
    /**
    Get the current unit.

    @method unit
    */
    'unit': function(){
        return this.unit || LocalStore.get('dapp_etherUnit');
    },
    /**
    Get the correct text, if TAPi18n is available.

    @method i18nText
    */
    'i18nText': function(key){
        if(typeof TAPi18n === 'undefined') {
            return (key === 'high') ? '+' : '-';
        } else {
            return TAPi18n.__('elements.selectGasPrice.'+ key);
        }
    }
});

Template['dapp_selectGasPrice'].events({
    /**
    Change the selected fee
    
    @event change input[name="fee"], input input[name="fee"]
    */
    'change input[name="fee"], input input[name="fee"]': function(e){
        TemplateVar.set('feeMultiplicator', Number(e.currentTarget.value));
    },
});