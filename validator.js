function Validator(formSelector, options) {
    //Gán giá trị mặc định cho tham số
    if (!options) {
        options = {};
    }
    function getParent(element, selector) {
        while (element.parentElement) { 
            if (element.parentElement.matches(selector)) {
                 return element.parentElement;               
            }
            element = element.parentElement;
        }
    }
    var formRules = {}
    //Qui ước tạo rules
    //* - nếu có lỗi sẽ return `error message`
    //*-  Nếu ko có lỗi sẽ trả về là `undefined`
    var validatorRules = {
        required: function(value) {
            return value ? undefined : "Vui lòng nhập trường này"
        },
        email: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : "Vui lòng nhập Email"
        },
        min: function(min) {
            return function (value) {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} kí tự`
            }
        },
        max: function(max) {
            return function (value) {
                return value.length <= max ? undefined : `Vui lòng nhập ít nhất ${max}} kí tự`
            }
        },
    }
    // Lấy ra form element trong DOM theo `formSelector`
    var formElement = document.querySelector(formSelector);
    // Chỉ xử lý khi có elemnet trong DOM
    if (formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]');
        for ( var input of inputs ) {
            var rules = input.getAttribute('rules').split('|');
            for ( var rule of rules) {
                var ruleInfo;
                var isRuleHasValue = rule.includes(':');

                if (isRuleHasValue) {
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0]
                }

                var ruleFunction = validatorRules[rule];
                if (isRuleHasValue) {
                    ruleFunction = ruleFunction(ruleInfo[1]);
                }  
                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunction);
                } else {
                    formRules[input.name]= [ruleFunction] ;
                }
            }
            // Lắng nghe sự kiện để validate
            input.onblur = handleValidate ;
            input.oninput = handleClearError ;
        } 
        //Hàm thực hiện validate
        function handleValidate(event) {
            var rules = formRules[event.target.name];
            var errorMessage ;
            rules.some(function(rule) {
                errorMessage = rule(event.target.value)
                return errorMessage;
            })
            if (errorMessage) {
                var formGroup = getParent(event.target, '.form-group')
                if (formGroup) {
                    formGroup.classList.add('invalid');
                    var formMessage = formGroup.querySelector('.form-message');
                    if (formMessage) {
                        formMessage.innerText = errorMessage;
                    }
                }
            } 
            return !errorMessage;
        }
        function handleClearError(event) {
            var formGroup = getParent(event.target, '.form-group')
            if (formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid');
                var formMessage = formGroup.querySelector('.form-message');
                if (formMessage) {
                    formMessage.innerText = '';
                }
            }
        }
    }
    // Xử lý hành vi submit form
    formElement.onsubmit = function (event) {
        event.preventDefault();

        var inputs = formElement.querySelectorAll('[name][rules]');
        var isValid = true;
        for ( var input of inputs ) {
            if (!handleValidate({ target: input })) {
                isValid = false;
            }
        }
        //Khi ko có lỗi thì submit form
        if (isValid) {
            if ( typeof options.onSubmit === 'function') {
                options.onSubmit()
            } else {  
                formElement.submit();
            }
        }
    }
}