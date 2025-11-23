'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _ReactForm = require('app/utils/ReactForm');

var _ReactForm2 = _interopRequireDefault(_ReactForm);

var _immutable = require('immutable');

var _reactRedux = require('react-redux');

var _TransactionReducer = require('app/redux/TransactionReducer');

var transactionActions = _interopRequireWildcard(_TransactionReducer);

var _UserReducer = require('app/redux/UserReducer');

var userActions = _interopRequireWildcard(_UserReducer);

var _MarkdownViewer = require('app/components/cards/MarkdownViewer');

var _MarkdownViewer2 = _interopRequireDefault(_MarkdownViewer);

var _TagInput = require('app/components/cards/TagInput');

var _TagInput2 = _interopRequireDefault(_TagInput);

var _SlateEditor = require('app/components/elements/SlateEditor');

var _SlateEditor2 = _interopRequireDefault(_SlateEditor);

var _LoadingIndicator = require('app/components/elements/LoadingIndicator');

var _LoadingIndicator2 = _interopRequireDefault(_LoadingIndicator);

var _PostCategoryBanner = require('app/components/elements/PostCategoryBanner');

var _PostCategoryBanner2 = _interopRequireDefault(_PostCategoryBanner);

var _shouldComponentUpdate = require('app/utils/shouldComponentUpdate');

var _shouldComponentUpdate2 = _interopRequireDefault(_shouldComponentUpdate);

var _Tooltip = require('app/components/elements/Tooltip');

var _Tooltip2 = _interopRequireDefault(_Tooltip);

var _SanitizeConfig = require('app/utils/SanitizeConfig');

var _SanitizeConfig2 = _interopRequireDefault(_SanitizeConfig);

var _sanitizeHtml = require('sanitize-html');

var _sanitizeHtml2 = _interopRequireDefault(_sanitizeHtml);

var _HtmlReady = require('shared/HtmlReady');

var _HtmlReady2 = _interopRequireDefault(_HtmlReady);

var _remarkable = require('remarkable');

var _remarkable2 = _interopRequireDefault(_remarkable);

var _reactDropzone = require('react-dropzone');

var _reactDropzone2 = _interopRequireDefault(_reactDropzone);

var _counterpart = require('counterpart');

var _counterpart2 = _interopRequireDefault(_counterpart);

var _ServerApiClient = require('app/utils/ServerApiClient');

var _PrimaryNavigation = require('app/components/cards/PrimaryNavigation');

var _PrimaryNavigation2 = _interopRequireDefault(_PrimaryNavigation);

var _SteemMarket = require('app/components/elements/SteemMarket');

var _SteemMarket2 = _interopRequireDefault(_SteemMarket);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var remarkable = new _remarkable2.default({ html: true, linkify: false, breaks: true });

var RTE_DEFAULT = false;
var MAX_TAGS = 8;
var MAX_FILE_TO_UPLOAD = 10;
var imagesToUpload = [];

function allTags(userInput, originalCategory, hashtags) {
    // take space-delimited user input
    var tags = (0, _immutable.OrderedSet)(userInput ? userInput.trim().replace(/#/g, '').split(/ +/) : []);

    // remove original cat, if present
    if (originalCategory && /^[-a-z\d]+$/.test(originalCategory)) tags = tags.delete(originalCategory);

    // append hashtags from post until limit is reached
    var tagged = [].concat((0, _toConsumableArray3.default)(hashtags));
    while (tags.size < MAX_TAGS && tagged.length > 0) {
        tags = tags.add(tagged.shift());
    }

    return tags;
}

var ReplyEditor = (_temp = _class = function (_React$Component) {
    (0, _inherits3.default)(ReplyEditor, _React$Component);

    function ReplyEditor(props) {
        (0, _classCallCheck3.default)(this, ReplyEditor);

        var _this = (0, _possibleConstructorReturn3.default)(this, (ReplyEditor.__proto__ || (0, _getPrototypeOf2.default)(ReplyEditor)).call(this));

        _this.shouldComponentUpdate = (0, _shouldComponentUpdate2.default)(_this, 'ReplyEditor');

        _this.onTitleChange = function (e) {
            var value = e.target.value;
            // TODO block links in title (they do not make good permlinks)
            var hasMarkdown = /(?:\*[\w\s]*\*|\#[\w\s]*\#|_[\w\s]*_|~[\w\s]*~|\]\s*\(|\]\s*\[)/.test(value);
            _this.setState({
                titleWarn: hasMarkdown ? (0, _counterpart2.default)('reply_editor.markdown_not_supported') : ''
            });
            var title = _this.state.title;

            title.props.onChange(e);
        };

        _this.onCancel = function (e) {
            if (e) e.preventDefault();
            var _this$props = _this.props,
                formId = _this$props.formId,
                onCancel = _this$props.onCancel,
                defaultPayoutType = _this$props.defaultPayoutType;
            var _this$state = _this.state,
                replyForm = _this$state.replyForm,
                body = _this$state.body;

            if (!body.value || confirm((0, _counterpart2.default)('reply_editor.are_you_sure_you_want_to_clear_this_form'))) {
                replyForm.resetForm();
                if (_this.refs.rte) _this.refs.rte.setState({ state: stateFromHtml() });
                _this.setState({ progress: {} });
                _this.props.setPayoutType(formId, defaultPayoutType);
                _this.props.setBeneficiaries(formId, []);
                if (onCancel) onCancel(e);
            }

            _this.setState({ draft_permlink: '' });
        };

        _this.clearDraft = function (deletedDraftPermlink) {
            var draft_permlink = _this.state.draft_permlink;

            if (draft_permlink === deletedDraftPermlink) _this.setState({ draft_permlink: '' });
        };

        _this.onChange = function (rte_value) {
            _this.refs.rte.setState({ state: rte_value });
            var html = stateToHtml(rte_value);
            var body = _this.state.body;

            if (body.value !== html) body.props.onChange(html);
        };

        _this.toggleRte = function (e) {
            e.preventDefault();
            var state = { rte: !_this.state.rte };
            if (state.rte) {
                var body = _this.state.body;

                state.rte_value = isHtmlTest(body.value) ? stateFromHtml(body.value) : stateFromMarkdown(body.value);
            }
            _this.setState(state);
            localStorage.setItem('replyEditorData-rte', !_this.state.rte);
        };

        _this.onDraftsClose = function (draft) {
            var username = _this.props.username;
            var _this$state2 = _this.state,
                body = _this$state2.body,
                tags = _this$state2.tags,
                title = _this$state2.title,
                rte = _this$state2.rte;

            var raw = void 0;

            if (tags) {
                _this.checkTagsCommunity(draft.tags);
                tags.props.onChange(draft.tags);
            }

            if (title) title.props.onChange(draft.title);

            raw = draft.body;

            // If we have an initial body, check if it's html or markdown

            // console.log("initial reply body:", raw || '(empty)')
            body.props.onChange(raw);
            _this.setState({ draft_permlink: username + '^' + draft.permlink });
        };

        _this.showDrafts = function (e) {
            e.preventDefault();
            _this.props.showDrafts(_this.props.formId, _this.onDraftsClose, _this.clearDraft);
        };

        _this.onClickSaveDraft = function (e) {
            e.preventDefault();
            _this.saveDraft();
        };

        _this.onTemplatesClose = function (template) {
            var body = _this.state.body;

            var raw = '';

            if (body.value) {
                raw = body.value;
            }

            raw += '\n' + template;

            // If we have an initial body, check if it's html or markdown

            // console.log("initial reply body:", raw || '(empty)')
            body.props.onChange(raw);
            console.log(template);
        };

        _this.showTemplates = function (e) {
            e.preventDefault();
            _this.props.showTemplates(_this.props.formId, _this.onTemplatesClose);
        };

        _this.saveDraft = function () {
            var draftList = JSON.parse(localStorage.getItem('draft-list')) || [];

            var editedDraft = {
                author: _this.props.username,
                title: _this.state.title.value,
                body: _this.state.body.value,
                tags: _this.state.tags.value,
                permlink: _this.state.draft_permlink ? _this.state.draft_permlink.split('^')[1] : _this.props.username + '-' + new Date().toISOString().replace(':', '-').split('.')[0],
                timestamp: new Date().toISOString()
            };

            if (_this.state.draft_permlink) {
                var draftIdx = draftList.findIndex(function (data) {
                    return data.author === editedDraft.author && data.permlink === editedDraft.permlink;
                });

                if (draftIdx > -1) {
                    draftList[draftIdx] = editedDraft;
                }
            } else {
                draftList.push(editedDraft);
                _this.setState({
                    draft_permlink: _this.props.username + '^' + editedDraft.permlink
                });
            }

            localStorage.setItem('draft-list', (0, _stringify2.default)(draftList));
            alert('' + (0, _counterpart2.default)('reply_editor.draft_save_message'));
        };

        _this.showAdvancedSettings = function (e) {
            e.preventDefault();
            _this.props.setPayoutType(_this.props.formId, _this.props.payoutType);
            _this.props.showAdvancedSettings(_this.props.formId);
        };

        _this.displayErrorMessage = function (message) {
            _this.setState({
                progress: { error: message }
            });

            setTimeout(function () {
                _this.setState({ progress: {} });
            }, 6000); // clear message
        };

        _this.onDrop = function (acceptedFiles, rejectedFiles) {
            if (!acceptedFiles.length) {
                if (rejectedFiles.length) {
                    _this.displayErrorMessage('Please insert only image files.');
                    console.log('onDrop Rejected files: ', rejectedFiles);
                }
                return;
            }

            if (acceptedFiles.length > MAX_FILE_TO_UPLOAD) {
                _this.displayErrorMessage('Please upload up to maximum ' + MAX_FILE_TO_UPLOAD + ' images.');
                console.log('onDrop too many files to upload');
                return;
            }

            for (var fi = 0; fi < acceptedFiles.length; fi += 1) {
                var acceptedFile = acceptedFiles[fi];
                var imageToUpload = {
                    file: acceptedFile,
                    temporaryTag: ''
                };
                imagesToUpload.push(imageToUpload);
            }

            _this.insertPlaceHolders();
            _this.uploadNextImage();
        };

        _this.onOpenClick = function () {
            _this.dropzone.open();
        };

        _this.onPasteCapture = function (e) {
            try {
                if (e.clipboardData) {
                    // @TODO: currently it seems to capture only one file, try to find a fix for multiple files
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = (0, _getIterator3.default)(e.clipboardData.items), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var item = _step.value;

                            if (item.kind === 'file' && /^image\//.test(item.type)) {
                                var blob = item.getAsFile();
                                imagesToUpload.push({
                                    file: blob,
                                    temporaryTag: ''
                                });
                            }
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    _this.insertPlaceHolders();
                    _this.uploadNextImage();
                } else {
                    // http://joelb.me/blog/2011/code-snippet-accessing-clipboard-images-with-javascript/
                    // contenteditable element that catches all pasted data
                    _this.setState({ noClipboardData: true });
                }
            } catch (error) {
                console.error('Error analyzing clipboard event', error);
            }
        };

        _this.uploadNextImage = function () {
            if (imagesToUpload.length > 0) {
                var nextImage = imagesToUpload.pop();
                _this.upload(nextImage);
            }
        };

        _this.insertPlaceHolders = function () {
            var imagesUploadCount = _this.state.imagesUploadCount;
            var body = _this.state.body;
            var selectionStart = _this.refs.postRef.selectionStart;

            var placeholder = '';

            for (var ii = 0; ii < imagesToUpload.length; ii += 1) {
                var imageToUpload = imagesToUpload[ii];

                if (imageToUpload.temporaryTag === '') {
                    imagesUploadCount++;
                    imageToUpload.temporaryTag = '![Uploading image #' + imagesUploadCount + '...]()';
                    placeholder += '\n' + imageToUpload.temporaryTag + '\n';
                }
            }

            _this.setState({ imagesUploadCount: imagesUploadCount });

            // Insert the temporary tag where the cursor currently is
            body.props.onChange(body.value.substring(0, selectionStart) + placeholder + body.value.substring(selectionStart, body.value.length));
        };

        _this.upload = function (image) {
            var uploadImage = _this.props.uploadImage;

            _this.setState({
                progress: { message: (0, _counterpart2.default)('reply_editor.uploading') }
            });

            uploadImage(image.file, function (progress) {
                var body = _this.state.body;


                if (progress.url) {
                    _this.setState({ progress: {} });
                    var url = progress.url;

                    var imageMd = '![' + image.file.name + '](' + url + ')';

                    // Replace temporary image MD tag with the real one
                    body.props.onChange(body.value.replace(image.temporaryTag, imageMd));

                    _this.uploadNextImage();
                } else {
                    if (progress.hasOwnProperty('error')) {
                        _this.displayErrorMessage(progress.error);
                        var _imageMd = '![' + image.file.name + '](UPLOAD FAILED)';

                        // Remove temporary image MD tag
                        body.props.onChange(body.value.replace(image.temporaryTag, _imageMd));
                    } else {
                        _this.setState({ progress: progress });
                    }
                }
            });
        };

        _this.state = { progress: {}, imagesUploadCount: 0, draft_permlink: '' };
        _this.initForm(props);
        return _this;
    }

    (0, _createClass3.default)(ReplyEditor, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var formId = this.props.formId;


            if (process.env.BROWSER) {
                // Check for rte editor preference
                var rte = this.props.isStory && JSON.parse(localStorage.getItem('replyEditorData-rte') || RTE_DEFAULT);
                var raw = null;

                // Process initial body value (if this is an edit)
                var body = this.state.body;

                if (body.value) {
                    raw = body.value;
                }

                // Check for draft data
                var draft = localStorage.getItem('replyEditorData-' + formId);
                if (draft) {
                    draft = JSON.parse(draft);
                    var _state = this.state,
                        tags = _state.tags,
                        title = _state.title;


                    if (tags) {
                        this.checkTagsCommunity(draft.tags);
                        tags.props.onChange(draft.tags);
                    }

                    if (title) title.props.onChange(draft.title);
                    if (draft.payoutType) this.props.setPayoutType(formId, draft.payoutType);
                    if (draft.beneficiaries) this.props.setBeneficiaries(formId, draft.beneficiaries);
                    raw = draft.body;
                }

                // If we have an initial body, check if it's html or markdown
                if (raw) {
                    rte = isHtmlTest(raw);
                }

                // console.log("initial reply body:", raw || '(empty)')
                body.props.onChange(raw);
                this.setState({
                    rte: rte,
                    rte_value: rte ? stateFromHtml(raw) : null
                });
            }

            // Overwrite category (even if draft loaded) if authoritative category was provided
            if (this.props.category) {
                if (this.state.tags) {
                    this.state.tags.props.onChange(this.props.initialValues.tags);
                }
                this.checkTagsCommunity(this.props.category);
            }
        }
    }, {
        key: 'checkTagsCommunity',
        value: function checkTagsCommunity(tagsInput) {
            var community = null;
            if (tagsInput) {
                var primary = tagsInput.split(' ')[0];
                if (primary.substring(0, 5) == 'hive-') {
                    community = primary;
                    this.setState({ disabledCommunity: null });
                }
            }
            this.setState({ community: community });
        }
    }, {
        key: 'shiftTagInput',
        value: function shiftTagInput() {
            var tags = this.state.tags;

            var items = tags.value.split(' ');
            this.setState({ disabledCommunity: items.shift() });
            tags.props.onChange(items.join(' '));
        }
    }, {
        key: 'unshiftTagInput',
        value: function unshiftTagInput(tag) {
            var tags = this.state.tags;

            tags.props.onChange(tag + ' ' + tags.value);
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            setTimeout(function () {
                if (_this2.refs.rte) _this2.refs.rte._focus();else if (_this2.props.isStory) _this2.refs.titleRef.focus();else if (_this2.refs.postRef) _this2.refs.postRef.focus();
            }, 300);
            window.addEventListener('beforeunload', this.handleBeforeUnload);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            window.removeEventListener('beforeunload', this.handleBeforeUnload);
        }
    }, {
        key: 'componentWillUpdate',
        value: function componentWillUpdate(nextProps, nextState) {
            var _this3 = this;

            if (process.env.BROWSER) {
                var ts = this.state;
                var ns = nextState;
                var tp = this.props;
                var np = nextProps;

                // Save curent draft to localStorage
                if (ts.body.value !== ns.body.value || ns.tags && ts.tags.value !== ns.tags.value || ns.title && ts.title.value !== ns.title.value || np.payoutType !== tp.payoutType || np.beneficiaries !== tp.beneficiaries) {
                    // also prevents saving after parent deletes this information
                    var formId = np.formId,
                        payoutType = np.payoutType,
                        beneficiaries = np.beneficiaries;
                    var tags = ns.tags,
                        title = ns.title,
                        body = ns.body;

                    var data = {
                        formId: formId,
                        title: title ? title.value : undefined,
                        tags: tags ? tags.value : undefined,
                        body: body.value,
                        payoutType: payoutType,
                        beneficiaries: beneficiaries
                    };

                    clearTimeout(saveEditorTimeout);
                    saveEditorTimeout = setTimeout(function () {
                        // console.log('save formId', formId, body.value)
                        localStorage.setItem('replyEditorData-' + formId, (0, _stringify2.default)(data, null, 0));
                        _this3.showDraftSaved();
                    }, 500);
                }

                if (ns.tags && ts.tags && ts.tags.value !== ns.tags.value) {
                    this.checkTagsCommunity(ns.tags.value);
                }
            }
        }
    }, {
        key: 'initForm',
        value: function initForm(props) {
            var isStory = props.isStory,
                type = props.type,
                fields = props.fields;

            var isEdit = type === 'edit';
            var maxKb = isStory ? 64 : 16;
            (0, _ReactForm2.default)({
                fields: fields,
                instance: this,
                name: 'replyForm',
                initialValues: props.initialValues,
                validation: function validation(values) {
                    var bodyValidation = null;
                    if (!values.body) {
                        bodyValidation = (0, _counterpart2.default)('g.required');
                    }
                    if (values.body && new Blob([values.body]).size >= maxKb * 1024 - 256) {
                        bodyValidation = 'Post body exceeds ' + (maxKb * 1024 - 256) + ' bytes.';
                    }
                    return {
                        title: isStory && (!values.title || values.title.trim() === '' ? (0, _counterpart2.default)('g.required') : values.title.length > 255 ? (0, _counterpart2.default)('reply_editor.shorten_title') : null),
                        tags: isStory && (0, _TagInput.validateTagInput)(values.tags, !isEdit),
                        body: bodyValidation
                    };
                }
            });
        }

        // As rte_editor is updated, keep the (invisible) 'body' field in sync.

    }, {
        key: 'showDraftSaved',
        value: function showDraftSaved() {
            var draft = this.refs.draft;

            if (draft) {
                draft.className = 'ReplyEditor__draft';
                void draft.offsetWidth; // reset animation
                draft.className = 'ReplyEditor__draft ReplyEditor__draft-saved';
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var originalPost = {
                category: this.props.category,
                body: this.props.body
            };
            var onCancel = this.onCancel,
                onTitleChange = this.onTitleChange;
            var _state2 = this.state,
                title = _state2.title,
                tags = _state2.tags,
                body = _state2.body,
                community = _state2.community,
                disabledCommunity = _state2.disabledCommunity;
            var _props = this.props,
                reply = _props.reply,
                username = _props.username,
                isStory = _props.isStory,
                formId = _props.formId,
                author = _props.author,
                permlink = _props.permlink,
                parent_author = _props.parent_author,
                parent_permlink = _props.parent_permlink,
                type = _props.type,
                jsonMetadata = _props.jsonMetadata,
                successCallback = _props.successCallback,
                defaultPayoutType = _props.defaultPayoutType,
                payoutType = _props.payoutType,
                beneficiaries = _props.beneficiaries,
                steemMarketData = _props.steemMarketData;
            var _state$replyForm = this.state.replyForm,
                submitting = _state$replyForm.submitting,
                valid = _state$replyForm.valid,
                handleSubmit = _state$replyForm.handleSubmit,
                resetForm = _state$replyForm.resetForm;
            var _state3 = this.state,
                postError = _state3.postError,
                titleWarn = _state3.titleWarn,
                rte = _state3.rte;
            var _state4 = this.state,
                progress = _state4.progress,
                noClipboardData = _state4.noClipboardData;

            var disabled = submitting || !valid;
            var loading = submitting || this.state.loading;

            var errorCallback = function errorCallback(estr) {
                _this4.setState({ postError: estr, loading: false });
            };
            var isEdit = type === 'edit';
            var successCallbackWrapper = function successCallbackWrapper() {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                if (!isEdit) {
                    resetForm();
                }
                _this4.setState({ loading: false });
                _this4.props.setPayoutType(formId, defaultPayoutType);
                _this4.props.setBeneficiaries(formId, []);
                if (successCallback) successCallback(args);
            };
            var isHtml = rte || isHtmlTest(body.value);
            var replyParams = {
                author: author,
                permlink: permlink,
                parent_author: parent_author,
                parent_permlink: parent_permlink,
                type: type,
                username: username,
                originalPost: originalPost,
                isHtml: isHtml,
                isStory: isStory,
                jsonMetadata: jsonMetadata,
                payoutType: payoutType,
                beneficiaries: beneficiaries,
                successCallback: successCallbackWrapper,
                errorCallback: errorCallback
            };
            var postLabel = username ? _react2.default.createElement(
                _Tooltip2.default,
                { t: (0, _counterpart2.default)('g.post_as_user', { username: username }) },
                (0, _counterpart2.default)('g.post')
            ) : (0, _counterpart2.default)('g.post');
            var hasTitleError = title && title.touched && title.error;
            var titleError = null;
            // The Required title error (triggered onBlur) can shift the form making it hard to click on things..
            if (hasTitleError && (title.error !== (0, _counterpart2.default)('g.required') || body.value !== '') || titleWarn) {
                titleError = _react2.default.createElement(
                    'div',
                    { className: hasTitleError ? 'error' : 'warning' },
                    hasTitleError ? title.error : titleWarn,
                    '\xA0'
                );
            }

            // TODO: remove all references to these vframe classes. Removed from css and no longer needed.
            var vframe_class = isStory ? 'vframe' : '';
            var vframe_section_class = isStory ? 'vframe__section' : '';
            var vframe_section_shrink_class = isStory ? 'vframe__section--shrink' : '';

            return _react2.default.createElement(
                'div',
                { className: 'Post' },
                _react2.default.createElement(
                    'div',
                    { className: 'post-content' },
                    isStory && !isEdit && _react2.default.createElement(
                        'div',
                        { className: 'c-sidebr-ads' },
                        _react2.default.createElement(_PrimaryNavigation2.default, {
                            routeTag: 'post',
                            category: 'undefined'
                        })
                    ),
                    _react2.default.createElement(
                        'div',
                        { className: 'post-main' },
                        isStory && !isEdit && username && _react2.default.createElement(_PostCategoryBanner2.default, {
                            communityName: community,
                            disabledCommunity: disabledCommunity,
                            username: username,
                            onCancel: this.shiftTagInput.bind(this),
                            onUndo: this.unshiftTagInput.bind(this)
                        }),
                        _react2.default.createElement(
                            'div',
                            { className: 'column small-12' },
                            _react2.default.createElement(
                                'div',
                                {
                                    ref: 'draft',
                                    className: 'ReplyEditor__draft ReplyEditor__draft-hide'
                                },
                                (0, _counterpart2.default)('reply_editor.draft_saved')
                            ),
                            _react2.default.createElement(
                                'form',
                                {
                                    className: vframe_class,
                                    onSubmit: handleSubmit(function (_ref) {
                                        var data = _ref.data;

                                        var startLoadingIndicator = function startLoadingIndicator() {
                                            return _this4.setState({
                                                loading: true,
                                                postError: undefined
                                            });
                                        };
                                        reply((0, _extends3.default)({}, data, replyParams, {
                                            startLoadingIndicator: startLoadingIndicator
                                        }));
                                    }),
                                    onChange: function onChange() {
                                        _this4.setState({ postError: null });
                                    }
                                },
                                _react2.default.createElement(
                                    'div',
                                    { className: vframe_section_shrink_class },
                                    isStory && _react2.default.createElement(
                                        'span',
                                        null,
                                        _react2.default.createElement('input', (0, _extends3.default)({
                                            type: 'text',
                                            className: 'ReplyEditor__title',
                                            onChange: onTitleChange,
                                            disabled: loading,
                                            placeholder: (0, _counterpart2.default)('reply_editor.title'),
                                            autoComplete: 'off',
                                            ref: 'titleRef',
                                            tabIndex: 1
                                        }, title.props)),
                                        _react2.default.createElement(
                                            'div',
                                            {
                                                className: ' secondary',
                                                style: {
                                                    marginRight: '1rem',
                                                    display: 'flex',
                                                    justifyContent: 'space-between'
                                                }
                                            },
                                            _react2.default.createElement(
                                                'a',
                                                {
                                                    href: '#',
                                                    onClick: this.showTemplates,
                                                    style: { color: '#1FBF8F' }
                                                },
                                                (0, _counterpart2.default)('reply_editor.template')
                                            ),
                                            rte && _react2.default.createElement(
                                                'a',
                                                {
                                                    href: '#',
                                                    onClick: this.toggleRte
                                                },
                                                body.value ? 'Raw HTML' : 'Markdown'
                                            ),
                                            !rte && (isHtml || !body.value) && _react2.default.createElement(
                                                'a',
                                                {
                                                    href: '#',
                                                    onClick: this.toggleRte
                                                },
                                                (0, _counterpart2.default)('reply_editor.editor')
                                            )
                                        ),
                                        titleError
                                    )
                                ),
                                _react2.default.createElement(
                                    'div',
                                    {
                                        className: 'ReplyEditor__body ' + (rte ? 'rte ' + vframe_section_class : vframe_section_shrink_class)
                                    },
                                    process.env.BROWSER && rte ? _react2.default.createElement(_SlateEditor2.default, {
                                        ref: 'rte',
                                        placeholder: isStory ? 'Write your story...' : 'Reply',
                                        initialState: this.state.rte_value,
                                        onChange: this.onChange
                                    }) : _react2.default.createElement(
                                        'span',
                                        null,
                                        _react2.default.createElement(
                                            _reactDropzone2.default,
                                            {
                                                onDrop: this.onDrop,
                                                className: type === 'submit_story' ? 'dropzone' : 'none',
                                                disableClick: true,
                                                multiple: true,
                                                accept: 'image/*',
                                                ref: function ref(node) {
                                                    _this4.dropzone = node;
                                                }
                                            },
                                            _react2.default.createElement('textarea', (0, _extends3.default)({}, body.props, {
                                                ref: 'postRef',
                                                onPasteCapture: this.onPasteCapture,
                                                className: type === 'submit_story' ? 'upload-enabled' : '',
                                                disabled: loading,
                                                rows: isStory ? 10 : 3,
                                                placeholder: isStory ? (0, _counterpart2.default)('g.write_your_story') : (0, _counterpart2.default)('g.reply'),
                                                autoComplete: 'off',
                                                tabIndex: 2
                                            }))
                                        ),
                                        _react2.default.createElement(
                                            'p',
                                            { className: 'drag-and-drop' },
                                            (0, _counterpart2.default)('reply_editor.insert_images_by_dragging_dropping'),
                                            noClipboardData ? '' : (0, _counterpart2.default)('reply_editor.pasting_from_the_clipboard'),
                                            (0, _counterpart2.default)('reply_editor.or_by'),
                                            ' ',
                                            _react2.default.createElement(
                                                'a',
                                                { onClick: this.onOpenClick },
                                                (0, _counterpart2.default)('reply_editor.selecting_them')
                                            ),
                                            '.'
                                        ),
                                        progress.message && _react2.default.createElement(
                                            'div',
                                            { className: 'info' },
                                            progress.message
                                        ),
                                        progress.error && _react2.default.createElement(
                                            'div',
                                            { className: 'error' },
                                            (0, _counterpart2.default)('reply_editor.image_upload'),
                                            ' ',
                                            ': ',
                                            progress.error
                                        )
                                    )
                                ),
                                _react2.default.createElement(
                                    'div',
                                    { className: vframe_section_shrink_class },
                                    _react2.default.createElement(
                                        'div',
                                        { className: 'error' },
                                        body.touched && body.error && body.error !== 'Required' && body.error
                                    )
                                ),
                                _react2.default.createElement(
                                    'div',
                                    {
                                        className: vframe_section_shrink_class,
                                        style: { marginTop: '0.5rem' }
                                    },
                                    isStory && _react2.default.createElement(
                                        'span',
                                        null,
                                        _react2.default.createElement(_TagInput2.default, (0, _extends3.default)({}, tags.props, {
                                            onChange: tags.props.onChange,
                                            disabled: loading,
                                            isEdit: isEdit,
                                            tabIndex: 3
                                        })),
                                        _react2.default.createElement(
                                            'div',
                                            { className: 'error' },
                                            (tags.touched || tags.value) && tags.error,
                                            '\xA0'
                                        )
                                    )
                                ),
                                _react2.default.createElement(
                                    'div',
                                    { className: vframe_section_shrink_class },
                                    isStory && !isEdit && _react2.default.createElement(
                                        'div',
                                        { className: 'ReplyEditor__options' },
                                        _react2.default.createElement(
                                            'div',
                                            null,
                                            _react2.default.createElement(
                                                'div',
                                                null,
                                                (0, _counterpart2.default)('g.rewards'),
                                                ': ',
                                                this.props.payoutType == '0%' && (0, _counterpart2.default)('reply_editor.decline_payout'),
                                                this.props.payoutType == '50%' && (0, _counterpart2.default)('reply_editor.default_50_50'),
                                                this.props.payoutType == '100%' && (0, _counterpart2.default)('reply_editor.power_up_100')
                                            ),
                                            _react2.default.createElement(
                                                'div',
                                                null,
                                                beneficiaries && beneficiaries.length > 0 && _react2.default.createElement(
                                                    'span',
                                                    null,
                                                    (0, _counterpart2.default)('g.beneficiaries'),
                                                    ': ',
                                                    (0, _counterpart2.default)('reply_editor.beneficiaries_set', {
                                                        count: beneficiaries.length
                                                    })
                                                )
                                            ),
                                            _react2.default.createElement(
                                                'a',
                                                {
                                                    href: '#',
                                                    onClick: this.showAdvancedSettings
                                                },
                                                (0, _counterpart2.default)('reply_editor.advanced_settings')
                                            ),
                                            ' ',
                                            _react2.default.createElement('br', null),
                                            '\xA0'
                                        )
                                    )
                                ),
                                _react2.default.createElement(
                                    'div',
                                    { className: vframe_section_shrink_class },
                                    postError && _react2.default.createElement(
                                        'div',
                                        { className: 'error' },
                                        postError
                                    )
                                ),
                                _react2.default.createElement(
                                    'div',
                                    { className: vframe_section_shrink_class },
                                    _react2.default.createElement(
                                        'div',
                                        { className: 'button-container' },
                                        _react2.default.createElement(
                                            'div',
                                            { className: 'item ' },
                                            !loading && _react2.default.createElement(
                                                'button',
                                                {
                                                    type: 'submit',
                                                    className: 'button',
                                                    disabled: disabled,
                                                    tabIndex: 4
                                                },
                                                isEdit ? (0, _counterpart2.default)('reply_editor.update_post') : postLabel
                                            ),
                                            loading && _react2.default.createElement(
                                                'span',
                                                null,
                                                _react2.default.createElement('br', null),
                                                _react2.default.createElement(_LoadingIndicator2.default, { type: 'circle' })
                                            ),
                                            '\xA0',
                                            ' ',
                                            !loading && this.props.onCancel && _react2.default.createElement(
                                                'button',
                                                {
                                                    type: 'button',
                                                    className: 'secondary hollow button no-border',
                                                    tabIndex: 5,
                                                    onClick: onCancel
                                                },
                                                (0, _counterpart2.default)('g.cancel')
                                            ),
                                            !loading && !this.props.onCancel && _react2.default.createElement(
                                                'button',
                                                {
                                                    className: 'button hollow no-border',
                                                    tabIndex: 5,
                                                    disabled: submitting,
                                                    onClick: onCancel
                                                },
                                                (0, _counterpart2.default)('g.clear')
                                            )
                                        ),
                                        isStory && _react2.default.createElement(
                                            'div',
                                            { className: 'item' },
                                            !loading && _react2.default.createElement(
                                                'button',
                                                {
                                                    className: 'button',
                                                    tabIndex: 7,
                                                    disabled: disabled,
                                                    onClick: this.onClickSaveDraft
                                                },
                                                this.state.draft_permlink ? (0, _counterpart2.default)('reply_editor.draft_update') : (0, _counterpart2.default)('reply_editor.draft_save')
                                            ),
                                            !loading && _react2.default.createElement(
                                                'button',
                                                {
                                                    className: 'button',
                                                    tabIndex: 6,
                                                    onClick: this.showDrafts
                                                },
                                                (0, _counterpart2.default)('reply_editor.draft')
                                            )
                                        )
                                    ),
                                    !isStory && !isEdit && this.props.payoutType != '50%' && _react2.default.createElement(
                                        'div',
                                        { className: 'ReplyEditor__options float-right text-right' },
                                        (0, _counterpart2.default)('g.rewards'),
                                        ': ',
                                        this.props.payoutType == '0%' && (0, _counterpart2.default)('reply_editor.decline_payout'),
                                        this.props.payoutType == '100%' && (0, _counterpart2.default)('reply_editor.power_up_100'),
                                        '. ',
                                        _react2.default.createElement(
                                            'a',
                                            {
                                                href: '/@' + username + '/settings'
                                            },
                                            'Update settings'
                                        )
                                    )
                                ),
                                !loading && !rte && body.value && _react2.default.createElement(
                                    'div',
                                    {
                                        className: 'Preview ' + vframe_section_shrink_class
                                    },
                                    !isHtml && _react2.default.createElement(
                                        'div',
                                        { className: 'float-right' },
                                        _react2.default.createElement(
                                            'a',
                                            {
                                                target: '_blank',
                                                href: 'https://guides.github.com/features/mastering-markdown/',
                                                rel: 'noopener noreferrer'
                                            },
                                            (0, _counterpart2.default)('reply_editor.markdown_styling_guide')
                                        )
                                    ),
                                    _react2.default.createElement(
                                        'h6',
                                        null,
                                        (0, _counterpart2.default)('g.preview')
                                    ),
                                    _react2.default.createElement(_MarkdownViewer2.default, {
                                        text: body.value,
                                        large: isStory
                                    })
                                )
                            )
                        )
                    ),
                    isStory && !isEdit && _react2.default.createElement(
                        'div',
                        { className: 'c-sidebr-market' },
                        !steemMarketData.isEmpty() && _react2.default.createElement(_SteemMarket2.default, { page: 'CoinMarketPlacePost' })
                    )
                )
            );
        }
    }]);
    return ReplyEditor;
}(_react2.default.Component), _class.propTypes = {
    // html component attributes
    formId: _propTypes2.default.string.isRequired, // unique form id for each editor
    type: _propTypes2.default.oneOf(['submit_story', 'submit_comment', 'edit']),
    successCallback: _propTypes2.default.func, // indicator that the editor is done and can be hidden
    onCancel: _propTypes2.default.func, // hide editor when cancel button clicked

    author: _propTypes2.default.string, // empty or string for top-level post
    permlink: _propTypes2.default.string, // new or existing category (default calculated from title)
    parent_author: _propTypes2.default.string, // empty or string for top-level post
    parent_permlink: _propTypes2.default.string, // new or existing category
    jsonMetadata: _propTypes2.default.object, // An existing comment has its own meta data
    category: _propTypes2.default.string, // initial value
    title: _propTypes2.default.string, // initial value
    body: _propTypes2.default.string, // initial value
    defaultPayoutType: _propTypes2.default.string,
    payoutType: _propTypes2.default.string
}, _class.defaultProps = {
    isStory: false,
    author: '',
    parent_author: '',
    parent_permlink: '',
    type: 'submit_comment'
}, _temp);


var saveEditorTimeout = void 0;

// removes <html></html> wrapper if exists
function stripHtmlWrapper(text) {
    var m = text.match(/<html>\n*([\S\s]+?)?\n*<\/html>/m);
    return m && m.length === 2 ? m[1] : text;
}
// See also MarkdownViewer render
var isHtmlTest = function isHtmlTest(text) {
    return (/^<html>/.test(text)
    );
};

function stateToHtml(state) {
    var html = (0, _SlateEditor.serializeHtml)(state);
    if (html === '<p></p>') html = '';
    if (html === '<p><br></p>') html = '';
    if (html == '') return '';
    return '<html>\n' + html + '\n</html>';
}

function stateFromHtml() {
    var html = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    if (html) html = stripHtmlWrapper(html);
    if (html && html.trim() == '') html = null;
    return html ? (0, _SlateEditor.deserializeHtml)(html) : (0, _SlateEditor.getDemoState)();
}

//var htmlclean = require('htmlclean');
function stateFromMarkdown(markdown) {
    var html = void 0;
    if (markdown && markdown.trim() !== '') {
        html = remarkable.render(markdown);
        html = (0, _HtmlReady2.default)(html).html; // TODO: option to disable youtube conversion, @-links, img proxy
        //html = htmlclean(html) // normalize whitespace
        console.log('markdown converted to:', html);
    }
    return stateFromHtml(html);
}

exports.default = function (formId) {
    return (0, _reactRedux.connect)(
    // mapStateToProps
    function (state, ownProps) {
        var username = state.user.getIn(['current', 'username']);
        var fields = ['body'];
        var type = ownProps.type,
            parent_author = ownProps.parent_author;

        var isEdit = type === 'edit';
        var isStory = /submit_story/.test(type) || isEdit && !parent_author;
        if (isStory) fields.push('title');
        if (isStory) fields.push('tags');

        var category = ownProps.category,
            title = ownProps.title,
            body = ownProps.body;

        if (/submit_/.test(type)) title = body = '';
        // type: PropTypes.oneOf(['submit_story', 'submit_comment', 'edit'])

        var query = state.routing.locationBeforeTransitions.query;
        if (query && query.category) {
            category = query.category;
        }

        var jsonMetadata = ownProps.jsonMetadata ? ownProps.jsonMetadata instanceof _immutable.Map ? ownProps.jsonMetadata.toJS() : ownProps.jsonMetadata : {};

        var tags = category;
        if (isStory && jsonMetadata && jsonMetadata.tags) {
            tags = (0, _immutable.OrderedSet)([category].concat((0, _toConsumableArray3.default)(jsonMetadata.tags))).join(' ');
        }
        var isNSFWCommunity = false;
        isNSFWCommunity = state.global.getIn(['community', category, 'is_nsfw']);
        if (isNSFWCommunity) {
            tags = tags + ' nsfw';
        }
        var defaultPayoutType = state.app.getIn(['user_preferences', isStory ? 'defaultBlogPayout' : 'defaultCommentPayout'], '50%');
        var payoutType = state.user.getIn(['current', 'post', formId, 'payoutType']);
        if (!payoutType) {
            payoutType = defaultPayoutType;
        }
        var beneficiaries = state.user.getIn(['current', 'post', formId, 'beneficiaries']);
        beneficiaries = beneficiaries ? beneficiaries.toJS() : [];
        var steemMarketData = state.app.get('steemMarket');

        // Post full
        /*
        const replyParams = {
            author,
            permlink,
            parent_author,
            parent_permlink,
            category,
            title,
            body: post.get('body'),
        }; */

        //ownProps:
        //  {...comment},
        //  author, permlink,
        //  body, title, category
        //  parent_author, parent_permlink,
        //  type, successCallback,
        //  successCallBack, onCancel
        return (0, _extends3.default)({}, ownProps, {
            type: type, //XX
            jsonMetadata: jsonMetadata, //XX (if not reply)
            category: category,
            fields: fields,
            isStory: isStory,
            username: username,
            defaultPayoutType: defaultPayoutType,
            payoutType: payoutType,
            beneficiaries: beneficiaries,
            initialValues: { title: title, body: body, tags: tags },
            formId: formId,
            steemMarketData: steemMarketData
        });
    },

    // mapDispatchToProps
    function (dispatch) {
        return {
            uploadImage: function uploadImage(file, progress) {
                return dispatch(userActions.uploadImage({ file: file, progress: progress }));
            },
            showAdvancedSettings: function showAdvancedSettings(formId) {
                return dispatch(userActions.showPostAdvancedSettings({ formId: formId }));
            },
            showDrafts: function showDrafts(formId, onDraftsClose, clearDraft) {
                return dispatch(userActions.showPostDrafts({
                    formId: formId,
                    onDraftsClose: onDraftsClose,
                    clearDraft: clearDraft
                }));
            },
            showTemplates: function showTemplates(formId, onTemplatesClose) {
                return dispatch(userActions.showPostTemplates({ formId: formId, onTemplatesClose: onTemplatesClose }));
            },
            setPayoutType: function setPayoutType(formId, payoutType) {
                return dispatch(userActions.set({
                    key: ['current', 'post', formId, 'payoutType'],
                    value: payoutType
                }));
            },
            setBeneficiaries: function setBeneficiaries(formId, beneficiaries) {
                return dispatch(userActions.set({
                    key: ['current', 'post', formId, 'beneficiaries'],
                    value: (0, _immutable.fromJS)(beneficiaries)
                }));
            },
            reply: function reply(_ref2) {
                var tags = _ref2.tags,
                    title = _ref2.title,
                    body = _ref2.body,
                    author = _ref2.author,
                    permlink = _ref2.permlink,
                    parent_author = _ref2.parent_author,
                    parent_permlink = _ref2.parent_permlink,
                    isHtml = _ref2.isHtml,
                    isStory = _ref2.isStory,
                    type = _ref2.type,
                    originalPost = _ref2.originalPost,
                    _ref2$payoutType = _ref2.payoutType,
                    payoutType = _ref2$payoutType === undefined ? '50%' : _ref2$payoutType,
                    _ref2$beneficiaries = _ref2.beneficiaries,
                    beneficiaries = _ref2$beneficiaries === undefined ? [] : _ref2$beneficiaries,
                    username = _ref2.username,
                    jsonMetadata = _ref2.jsonMetadata,
                    successCallback = _ref2.successCallback,
                    errorCallback = _ref2.errorCallback,
                    startLoadingIndicator = _ref2.startLoadingIndicator;

                var isEdit = type === 'edit';
                var isNew = /^submit_/.test(type);

                // Wire up the current and parent props for either an Edit or a Submit (new post)
                //'submit_story', 'submit_comment', 'edit'
                var linkProps = isNew ? {
                    // submit new
                    parent_author: author,
                    parent_permlink: permlink,
                    author: username
                    // permlink,  assigned in TransactionSaga
                } : // edit existing
                isEdit ? { author: author, permlink: permlink, parent_author: parent_author, parent_permlink: parent_permlink } : null;

                if (!linkProps) throw new Error('Unknown type: ' + type);

                // If this is an HTML post, it MUST begin and end with the tag
                if (isHtml && !body.match(/^<html>[\s\S]*<\/html>$/)) {
                    errorCallback('HTML posts must begin with <html> and end with </html>');
                    return;
                }

                var rtags = void 0;
                {
                    var html = isHtml ? body : remarkable.render(body);
                    rtags = (0, _HtmlReady2.default)(html, { mutate: false });
                }

                _SanitizeConfig.allowedTags.forEach(function (tag) {
                    rtags.htmltags.delete(tag);
                });
                if (isHtml) rtags.htmltags.delete('html'); // html tag allowed only in HTML mode
                if (rtags.htmltags.size) {
                    errorCallback('Please remove the following HTML elements from your post: ' + Array.apply(undefined, (0, _toConsumableArray3.default)(rtags.htmltags)).map(function (tag) {
                        return '<' + tag + '>';
                    }).join(', '));
                    return;
                }

                var metaTags = allTags(tags, originalPost.category, rtags.hashtags);

                // merge
                var meta = isEdit ? jsonMetadata : {};
                if (metaTags.size) meta.tags = metaTags.toJS();else delete meta.tags;
                if (rtags.usertags.size) meta.users = rtags.usertags;else delete meta.users;
                if (rtags.images.size) meta.image = rtags.images; // TODO: save first image
                else delete meta.image;
                if (rtags.links.size) meta.links = rtags.links; // TODO: remove? save first?
                else delete meta.links;

                meta.app = 'steemit/0.2';
                if (isStory) {
                    meta.format = isHtml ? 'html' : 'markdown';
                }

                var sanitizeErrors = [];
                (0, _sanitizeHtml2.default)(body, (0, _SanitizeConfig2.default)({ sanitizeErrors: sanitizeErrors }));
                if (sanitizeErrors.length) {
                    errorCallback(sanitizeErrors.join('.  '));
                    return;
                }

                if (meta.tags && meta.tags.length > MAX_TAGS) {
                    var includingCategory = isEdit ? (0, _counterpart2.default)('reply_editor.including_the_category', {
                        rootCategory: originalPost.category
                    }) : '';
                    errorCallback((0, _counterpart2.default)('reply_editor.use_limited_amount_of_tags', {
                        tagsLength: meta.tags.length,
                        includingCategory: includingCategory
                    }));
                    return;
                }

                startLoadingIndicator();

                var originalBody = isEdit ? originalPost.body : null;
                var __config = { originalBody: originalBody };
                // Avoid changing payout option during edits #735
                if (!isEdit) {
                    switch (payoutType) {
                        case '0%':
                            // decline payout
                            __config.comment_options = {
                                max_accepted_payout: '0.000 SBD'
                            };
                            break;
                        case '100%':
                            // 100% steem power payout
                            __config.comment_options = {
                                percent_steem_dollars: 0 // 10000 === 100% (of 50%)
                            };
                            break;
                        default: // 50% steem power, 50% sd+steem
                    }
                    if (beneficiaries && beneficiaries.length > 0) {
                        if (!__config.comment_options) {
                            __config.comment_options = {};
                        }
                        __config.comment_options.extensions = [[0, {
                            beneficiaries: beneficiaries.sort(function (a, b) {
                                return a.username < b.username ? -1 : a.username > b.username ? 1 : 0;
                            }).map(function (elt) {
                                return {
                                    account: elt.username,
                                    weight: parseInt(elt.percent) * 100
                                };
                            })
                        }]];
                    }
                }

                var operation = (0, _extends3.default)({}, linkProps, {
                    category: originalPost.category || metaTags.first(),
                    title: title,
                    body: body,
                    json_metadata: (0, _stringify2.default)(meta),
                    __config: __config
                });
                (0, _ServerApiClient.userActionRecord)('comment', {
                    username: username,
                    is_edit: isEdit,
                    payout_type: payoutType,
                    comment_type: /-reply$/.test(formId) ? 'reply' : 'post'
                });
                dispatch(transactionActions.broadcastOperation({
                    type: 'comment',
                    operation: operation,
                    errorCallback: errorCallback,
                    successCallback: successCallback
                }));
            }
        };
    })(ReplyEditor);
};