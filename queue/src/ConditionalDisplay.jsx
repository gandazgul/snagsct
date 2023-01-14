function ConditionalDisplay(props) {
    const { children, condition } = props;

    return condition ? children : null;
}

export default ConditionalDisplay;
