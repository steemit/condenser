import tt from 'counterpart';
import { select, takeEvery } from 'redux-saga/effects';
import { Signature, hash } from 'golos-js/lib/auth/ecc/index';

const MAX_UPLOAD_IMAGE_SIZE = 1024 * 1024;

export default function* uploadImageWatch() {
    yield takeEvery('user/UPLOAD_IMAGE', uploadImage);
}

const ERRORS_MATCH = [
    ['error uploading', 'user_saga_js.image_upload.error.err_uploading'],
    [
        'signature did not verify',
        'user_saga_js.image_upload.error.signature_did_not_verify',
    ],
    [
        'upload only images',
        'user_saga_js.image_upload.error.upload_only_images',
    ],
    ['upload failed', 'user_saga_js.image_upload.error.upload_failed'],
    [
        'unsupported posting key configuration',
        'user_saga_js.image_upload.error.unsupported_posting_key',
    ],
    [
        'is not found on the blockchain',
        'user_saga_js.image_upload.error.account_is_not_found',
    ],
];

function* uploadImage(action) {
    const { file, dataUrl, filename = 'image.txt', progress } = action.payload;

    function onError(txt) {
        progress({
            error: txt,
        });
    }

    if (!$STM_Config.upload_image) {
        onError('NO_UPLOAD_URL');
        return;
    }

    const user = yield select(state => state.user);
    const username = user.getIn(['current', 'username']);
    const postingKey = user.getIn([
        'current',
        'private_keys',
        'posting_private',
    ]);

    if (!username) {
        onError(tt('user_saga_js.image_upload.error.login_first'));
        return;
    }

    if (!postingKey) {
        onError(tt('user_saga_js.image_upload.error.login_with_posting_key'));
        return;
    }

    if (!file && !dataUrl) {
        onError(tt('user_saga_js.error_file_or_data_url_required'));
        return;
    }

    let data, dataBase64;

    if (file) {
        const reader = new FileReader();

        data = yield new Promise(resolve => {
            reader.addEventListener('load', () => {
                resolve(new Buffer(reader.result, 'binary'));
            });
            reader.readAsBinaryString(file);
        });
    } else {
        // recover from preview
        dataBase64 = dataUrl.substr(dataUrl.indexOf(',') + 1);
        data = new Buffer(dataBase64, 'base64');
    }

    if (file && file.size > MAX_UPLOAD_IMAGE_SIZE) {
        onError(tt('user_saga_js.image_upload.error.image_size_is_too_large'));
        return;
    }

    /**
     * The challenge needs to be prefixed with a constant (both on the server
     * and checked on the client) to make sure the server can't easily make the
     * client sign a transaction doing something else.
     */
    const prefix = new Buffer('ImageSigningChallenge');
    const bufSha = hash.sha256(Buffer.concat([prefix, data]));

    const formData = new FormData();

    if (file) {
        formData.append('file', file);
    } else {
        formData.append('filename', filename);
        formData.append('filebase64', dataBase64);
    }

    const sig = Signature.signBufferSha256(bufSha, postingKey);
    const postUrl = `${$STM_Config.upload_image}/${username}/${sig.toHex()}`;

    const xhr = new XMLHttpRequest();

    xhr.open('POST', postUrl);

    xhr.onload = function() {
        let data;

        try {
            data = JSON.parse(xhr.responseText);
        } catch (err) {
            onError(tt('user_saga_js.image_upload.error.upload_failed'));
            return;
        }

        const { url, error } = data;

        if (error) {
            if (typeof error === 'string') {
                const loverError = error.toLowerCase();

                for (let [text, translateId] of ERRORS_MATCH) {
                    if (loverError.includes(text)) {
                        onError(tt(translateId));
                        return;
                    }
                }
            }

            onError(error);
        } else {
            progress({
                url,
            });
        }
    };

    xhr.onerror = function(error) {
        onError(tt('user_saga_js.image_upload.error.server_unavailable'));
        console.error(error);
    };

    xhr.upload.onprogress = function(event) {
        if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);

            progress({
                percent,
                message: `${tt(
                    'user_saga_js.image_upload.uploading'
                )} ${percent}%`,
            });
        }
    };

    xhr.send(formData);
}
