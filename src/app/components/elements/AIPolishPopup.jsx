import React from 'react';
import PropTypes from 'prop-types';
// Removed MarkdownViewer as we will now render directly into an iframe.
// import MarkdownViewer from 'app/components/cards/MarkdownViewer';
import Remarkable from 'remarkable';
import HtmlReady from 'shared/HtmlReady';

// Instantiate a new Remarkable parser for converting markdown to HTML.
const remarkable = new Remarkable({ html: true, linkify: false, breaks: true });

class AIPolishPopup extends React.Component {
    // When the component is added to the DOM, we disable body scrolling.
    componentDidMount() {
        document.body.style.overflow = 'hidden';
    }

    // When the component is removed, we restore body scrolling.
    componentWillUnmount() {
        document.body.style.overflow = 'auto';
    }

    render() {
        const { content, onInsert, onCancel } = this.props;

        // Convert the markdown prop to a clean HTML fragment.
        const rawHtml = remarkable.render(content);
        const safeHtmlBody = HtmlReady(rawHtml).html;

        // Create a full HTML document string to be used in the iframe's srcDoc.
        // This includes self-contained styles to ensure the preview is readable
        // and consistent, regardless of the main application's CSS.
        const iframeContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                        line-height: 1.7;
                        color: #24292e;
                        background-color: #f9fafb;
                        padding: 1.5rem;
                        margin: 0;
                    }
                    h1, h2, h3, h4, h5, h6 {
                        margin-top: 24px;
                        margin-bottom: 16px;
                        font-weight: 600;
                        line-height: 1.25;
                    }
                    h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: .3em; }
                    h3 { font-size: 1.25em; }
                    p { margin-top: 0; margin-bottom: 16px; }
                    a { color: #0366d6; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                    ul, ol { padding-left: 2em; margin-top: 0; margin-bottom: 16px; }
                    li { margin-bottom: .25em; }
                    blockquote {
                        margin: 0 0 16px 0;
                        padding: 0 1em;
                        color: #6a737d;
                        border-left: 0.25em solid #dfe2e5;
                    }
                    hr {
                        height: .25em;
                        padding: 0;
                        margin: 24px 0;
                        background-color: #e1e4e8;
                        border: 0;
                    }
                    img { max-width: 100%; height: auto; }
                </style>
            </head>
            <body>
                ${safeHtmlBody}
            </body>
            </html>
        `;

        return (
            <div className="ai-polish-popup-overlay">
                <div className="ai-polish-popup-container">
                    <header className="ai-polish-popup-header">
                        <h4 className="text-xl font-bold">AI Polished Preview</h4>
                        <button onClick={onCancel} className="close-button">
                            &times;
                        </button>
                    </header>
                    <main className="ai-polish-popup-content-wrapper">
                        {/* The scrollable content is now a sandboxed iframe */}
                        <iframe
                            className="preview-iframe"
                            srcDoc={iframeContent}
                            title="AI Polished Preview"
                        />
                    </main>
                    <footer className="ai-polish-popup-footer">
                        <button
                            className="button hollow"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                        <button
                            className="button"
                            onClick={onInsert}
                        >
                            Insert to Post
                        </button>
                    </footer>
                </div>
                <style jsx>{`
                    .ai-polish-popup-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100vw;
                        height: 100vh;
                        background-color: rgba(0, 0, 0, 0.75);
                        z-index: 1050;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        animation: fadeIn 0.2s ease-out;
                    }

                    .ai-polish-popup-container {
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                        width: 90vw;
                        height: 90vh;
                        max-width: 1200px;
                        display: flex;
                        flex-direction: column;
                        overflow: hidden; 
                        animation: slideIn 0.3s ease-out;
                    }

                    .ai-polish-popup-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 1rem 1.5rem;
                        border-bottom: 1px solid #e5e7eb;
                        flex-shrink: 0;
                    }
                    
                    .close-button {
                        background: none;
                        border: none;
                        font-size: 2rem;
                        line-height: 1;
                        cursor: pointer;
                        color: #6b7280;
                        padding: 0.5rem;
                    }
                    
                    .close-button:hover {
                        color: #111827;
                    }

                    .ai-polish-popup-content-wrapper {
                        flex: 1 1 auto;
                        position: relative;
                        overflow: hidden;
                        background-color: #f9fafb;
                    }

                    .preview-iframe {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        border: none; /* Remove default iframe border */
                    }

                    .ai-polish-popup-footer {
                        display: flex;
                        justify-content: flex-end;
                        gap: 1rem;
                        padding: 1rem 1.5rem;
                        border-top: 1px solid #e5e7eb;
                        background-color: #ffffff;
                        flex-shrink: 0;
                    }

                    /* Animation Keyframes */
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    @keyframes slideIn {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}</style>
            </div>
        );
    }
}

AIPolishPopup.propTypes = {
    content: PropTypes.string.isRequired,
    onInsert: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default AIPolishPopup;
