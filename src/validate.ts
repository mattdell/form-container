import * as React from 'react';
import { isEmpty, forEach } from 'lodash';
import { hasError } from './validators';
import { ComponentInstance } from './interfaces';

const hoistNonReactStatics = require('hoist-non-react-statics');

const getValidationErrors = (rules: any[], model: {
    [name in string]: any;
}) => rules.reduce(
    (errors, [rule, field]) => {
        const isValid = rule(model);

        if (isValid) { return errors; }

        return {
            ...errors,
            ...field
        };
    },
    {}
);

const inferRulesFromAttributes = (rules: any[], { inputs }: any) => {
    const extendedRules = [...rules];

    forEach(inputs, (input: any) => {
        if (input.validity.valid === false) {
            const rule = hasError<any>(input.name, input.validationMessage);
            extendedRules.push(rule);
        }
    });

    return extendedRules;
};

export const validate = (rules: any[] = []) => (WrappedComponent: ComponentInstance) => {
    const validated = (props: any) => {
        const extendedRules = inferRulesFromAttributes(rules, props.form);
        const validationErrors = getValidationErrors(extendedRules, props.form.model);
        return React.createElement(WrappedComponent, Object.assign({}, props, {
            form: {
                ...props.form,
                isValid: isEmpty(validationErrors),
                validationErrors
            }
        }));
    };

    return hoistNonReactStatics(validated, WrappedComponent);
};
