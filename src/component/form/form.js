import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';
import Validator from '../../validator';

class Form extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = ::this.handleSubmit;
        this.state = {
            canValidate: false
        };
    }

    validateAll() {
        const {children} = this.props;
        const helpList = [];

        let childList = _.isArray(children) ? children : [children];

        _.each(childList, child => {
            if (child !== null && child !== undefined && child.type.displayName === 'FormItem') {
                if (child.props.error) {
                    helpList.push({
                        label: child.props.label,
                        help: child.props.error
                    });
                } else if (child.props.validate) {
                    let help = '';
                    if (child.props.required) {
                        help = child.props.validate(function (value) {
                            return Validator.validate(Validator.TYPE.required, value);
                        });
                    } else {
                        help = child.props.validate();
                    }
                    if (help) {
                        helpList.push({
                            label: child.props.label,
                            help
                        });
                    }
                }
            }
        });

        return helpList.length === 0 ? null : helpList;
    }

    handleSubmit(e) {
        e.preventDefault();
        this.setState({
            canValidate: true
        });

        this.props.onSubmit(e);

        const err = this.validateAll();
        if (!err) {
            this.props.onSubmitValidated();
        }
    }

    render() {
        const {
            inline,
            horizontal,
            labelWidth,
            className,
            children,
            onSubmitValidated, //eslint-disable-line
            ...rest
        } = this.props;

        let childList = _.isArray(children) ? children : [children];

        childList = _.map(childList, (child, i) => {
            return child !== null && child !== undefined && (child.type.displayName === 'FormItem' || child.type.displayName === 'FormBlock') ? React.cloneElement(child, Object.assign({
                key: i,
                horizontal,
                inline,
                labelWidth,
                canValidate: this.state.canValidate
            }, child.props)) : child;
        });

        return (
            <form
                {...rest}
                className={classNames('gm-form', {
                    'form-inline': inline,
                    'form-horizontal': horizontal
                }, className)}
                onSubmit={this.handleSubmit}
            >
                {childList}
            </form>
        );
    }
}

Form.propTypes = {
    inline: PropTypes.bool,
    horizontal: PropTypes.bool,
    labelWidth: PropTypes.string, // horizontal true 才有效
    onSubmit: PropTypes.func, // 默认处理了 preventDefault,
    onSubmitValidated: PropTypes.func
};

Form.defaultProps = {
    inline: false,
    horizontal: false,
    onSubmit: _.noop,
    onSubmitValidated: _.noop
};

export default Form;