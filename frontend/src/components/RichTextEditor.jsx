import React, { useState, useEffect, useRef } from 'react';
import { Editor, EditorState, RichUtils, getDefaultKeyBinding, convertToRaw, convertFromRaw, ContentState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaQuoteRight, FaLink, FaImage, FaCode, FaUndo, FaRedo } from 'react-icons/fa';

/**
 * RichTextEditor Component
 * 
 * A reusable rich text editor component built on top of Draft.js.
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Editor content in raw JSON format
 * @param {function} props.onChange - Function to call when editor content changes
 * @param {string} props.placeholder - Editor placeholder
 * @param {boolean} props.readOnly - Whether the editor is read-only
 * @param {string} props.className - Additional CSS classes for the editor
 * @param {number} props.minHeight - Minimum height of the editor
 * @param {number} props.maxHeight - Maximum height of the editor
 * @param {boolean} props.toolbar - Whether to show the toolbar
 * @param {Array} props.toolbarOptions - Array of toolbar options to show
 * @param {function} props.onFocus - Function to call when editor is focused
 * @param {function} props.onBlur - Function to call when editor is blurred
 */
const RichTextEditor = ({
  value,
  onChange,
  placeholder = 'Enter text...',
  readOnly = false,
  className = '',
  minHeight = 150,
  maxHeight = 400,
  toolbar = true,
  toolbarOptions = ['bold', 'italic', 'underline', 'unordered-list', 'ordered-list', 'blockquote', 'link', 'image', 'code'],
  onFocus,
  onBlur,
}) => {
  // Editor state
  const [editorState, setEditorState] = useState(() => {
    if (value) {
      try {
        const contentState = convertFromRaw(JSON.parse(value));
        return EditorState.createWithContent(contentState);
      } catch (error) {
        console.error('Error parsing editor content:', error);
        return EditorState.createEmpty();
      }
    }
    return EditorState.createEmpty();
  });

  // URL input state
  const [showURLInput, setShowURLInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [urlType, setUrlType] = useState('link'); // 'link' or 'image'

  // Editor ref
  const editorRef = useRef(null);
  const urlInputRef = useRef(null);

  // Focus the editor
  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Handle editor state changes
  const handleEditorChange = (newEditorState) => {
    setEditorState(newEditorState);
    
    if (onChange) {
      const contentState = newEditorState.getCurrentContent();
      const rawContent = convertToRaw(contentState);
      onChange(JSON.stringify(rawContent));
    }
  };

  // Handle key commands
  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      handleEditorChange(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  // Map key bindings
  const mapKeyToEditorCommand = (e) => {
    if (e.keyCode === 9 /* TAB */) {
      const newEditorState = RichUtils.onTab(e, editorState, 4 /* maxDepth */);
      if (newEditorState !== editorState) {
        handleEditorChange(newEditorState);
      }
      return null;
    }
    return getDefaultKeyBinding(e);
  };

  // Toggle block type
  const toggleBlockType = (blockType) => {
    handleEditorChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  // Toggle inline style
  const toggleInlineStyle = (inlineStyle) => {
    handleEditorChange(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  // Handle URL input
  const promptForURL = (type) => {
    setUrlType(type);
    setShowURLInput(true);
    setUrlValue('');
    setTimeout(() => urlInputRef.current?.focus(), 0);
  };

  // Confirm URL
  const confirmURL = (e) => {
    e.preventDefault();
    
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    
    let entityKey;
    
    if (urlType === 'link') {
      const contentStateWithEntity = contentState.createEntity('LINK', 'MUTABLE', { url: urlValue });
      entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      
      let newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
      newEditorState = RichUtils.toggleLink(newEditorState, selection, entityKey);
      handleEditorChange(newEditorState);
    } else if (urlType === 'image') {
      const contentStateWithEntity = contentState.createEntity('IMAGE', 'IMMUTABLE', { src: urlValue, alt: 'Image' });
      entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      
      const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
      handleEditorChange(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '));
    }
    
    setShowURLInput(false);
    setUrlValue('');
    setTimeout(() => focusEditor(), 0);
  };

  // Cancel URL input
  const cancelURL = () => {
    setShowURLInput(false);
    setUrlValue('');
    setTimeout(() => focusEditor(), 0);
  };

  // Handle undo
  const handleUndo = () => {
    handleEditorChange(EditorState.undo(editorState));
  };

  // Handle redo
  const handleRedo = () => {
    handleEditorChange(EditorState.redo(editorState));
  };

  // Render toolbar button
  const renderToolbarButton = (type, icon, label) => {
    let onClickHandler;
    let active = false;
    
    if (type === 'bold') {
      onClickHandler = () => toggleInlineStyle('BOLD');
      active = editorState.getCurrentInlineStyle().has('BOLD');
    } else if (type === 'italic') {
      onClickHandler = () => toggleInlineStyle('ITALIC');
      active = editorState.getCurrentInlineStyle().has('ITALIC');
    } else if (type === 'underline') {
      onClickHandler = () => toggleInlineStyle('UNDERLINE');
      active = editorState.getCurrentInlineStyle().has('UNDERLINE');
    } else if (type === 'unordered-list') {
      onClickHandler = () => toggleBlockType('unordered-list-item');
      const selection = editorState.getSelection();
      const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();
      active = blockType === 'unordered-list-item';
    } else if (type === 'ordered-list') {
      onClickHandler = () => toggleBlockType('ordered-list-item');
      const selection = editorState.getSelection();
      const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();
      active = blockType === 'ordered-list-item';
    } else if (type === 'blockquote') {
      onClickHandler = () => toggleBlockType('blockquote');
      const selection = editorState.getSelection();
      const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();
      active = blockType === 'blockquote';
    } else if (type === 'code') {
      onClickHandler = () => toggleBlockType('code-block');
      const selection = editorState.getSelection();
      const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();
      active = blockType === 'code-block';
    } else if (type === 'link') {
      onClickHandler = () => promptForURL('link');
    } else if (type === 'image') {
      onClickHandler = () => promptForURL('image');
    } else if (type === 'undo') {
      onClickHandler = handleUndo;
    } else if (type === 'redo') {
      onClickHandler = handleRedo;
    }
    
    return (
      <button
        key={type}
        type="button"
        className={`p-2 rounded-md ${active ? 'bg-gray-200 text-primary-600' : 'text-gray-600 hover:bg-gray-100'}`}
        title={label}
        onClick={onClickHandler}
        disabled={readOnly}
      >
        {icon}
      </button>
    );
  };

  // Render toolbar
  const renderToolbar = () => {
    const buttons = [
      { type: 'bold', icon: <FaBold size={14} />, label: 'Bold' },
      { type: 'italic', icon: <FaItalic size={14} />, label: 'Italic' },
      { type: 'underline', icon: <FaUnderline size={14} />, label: 'Underline' },
      { type: 'unordered-list', icon: <FaListUl size={14} />, label: 'Bullet List' },
      { type: 'ordered-list', icon: <FaListOl size={14} />, label: 'Numbered List' },
      { type: 'blockquote', icon: <FaQuoteRight size={14} />, label: 'Blockquote' },
      { type: 'link', icon: <FaLink size={14} />, label: 'Link' },
      { type: 'image', icon: <FaImage size={14} />, label: 'Image' },
      { type: 'code', icon: <FaCode size={14} />, label: 'Code Block' },
      { type: 'undo', icon: <FaUndo size={14} />, label: 'Undo' },
      { type: 'redo', icon: <FaRedo size={14} />, label: 'Redo' },
    ];
    
    const filteredButtons = buttons.filter(button => toolbarOptions.includes(button.type));
    
    return (
      <div className="flex items-center space-x-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-md">
        {filteredButtons.map(button => renderToolbarButton(button.type, button.icon, button.label))}
      </div>
    );
  };

  // Render URL input
  const renderURLInput = () => {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
        <div className="bg-white p-4 rounded-md shadow-lg w-80">
          <h3 className="text-lg font-medium mb-2">
            {urlType === 'link' ? 'Add Link' : 'Add Image'}
          </h3>
          <form onSubmit={confirmURL}>
            <input
              ref={urlInputRef}
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md mb-3"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder={urlType === 'link' ? 'https://example.com' : 'https://example.com/image.jpg'}
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                onClick={cancelURL}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-primary-600 text-white rounded-md text-sm"
                disabled={!urlValue}
              >
                Confirm
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Custom block renderer
  const blockRenderer = (contentBlock) => {
    const type = contentBlock.getType();
    
    if (type === 'atomic') {
      return {
        component: Media,
        editable: false,
      };
    }
    
    return null;
  };

  // Media component for rendering images
  const Media = (props) => {
    const entity = props.contentState.getEntity(props.block.getEntityAt(0));
    const { src, alt } = entity.getData();
    const type = entity.getType();
    
    if (type === 'IMAGE') {
      return <img src={src} alt={alt || ''} style={{ maxWidth: '100%' }} />;
    }
    
    return null;
  };

  // Block style function
  const getBlockStyle = (block) => {
    switch (block.getType()) {
      case 'blockquote':
        return 'border-l-4 border-gray-300 pl-4 italic text-gray-700';
      case 'code-block':
        return 'bg-gray-100 p-2 font-mono text-sm rounded';
      default:
        return '';
    }
  };

  // Style map for inline styles
  const styleMap = {
    CODE: {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
      fontSize: 16,
      padding: '2px 4px',
      borderRadius: 2,
    },
  };

  // Effect to update editor state when value prop changes
  useEffect(() => {
    if (value) {
      try {
        const contentState = convertFromRaw(JSON.parse(value));
        const newEditorState = EditorState.createWithContent(contentState);
        setEditorState(newEditorState);
      } catch (error) {
        console.error('Error parsing editor content:', error);
      }
    } else {
      setEditorState(EditorState.createEmpty());
    }
  }, [value]);

  // Import AtomicBlockUtils only if needed
  const AtomicBlockUtils = React.useMemo(() => {
    return require('draft-js').AtomicBlockUtils;
  }, []);

  return (
    <div className={`border border-gray-300 rounded-md ${className}`}>
      {toolbar && renderToolbar()}
      <div
        className={`relative ${toolbar ? '' : 'rounded-t-md'} rounded-b-md`}
        style={{ minHeight, maxHeight, overflow: 'auto' }}
        onClick={focusEditor}
      >
        <div className="px-3 py-2">
          <Editor
            ref={editorRef}
            editorState={editorState}
            onChange={handleEditorChange}
            placeholder={placeholder}
            handleKeyCommand={handleKeyCommand}
            keyBindingFn={mapKeyToEditorCommand}
            blockStyleFn={getBlockStyle}
            customStyleMap={styleMap}
            blockRendererFn={blockRenderer}
            readOnly={readOnly}
            onFocus={onFocus}
            onBlur={onBlur}
            spellCheck={true}
          />
        </div>
        {showURLInput && renderURLInput()}
      </div>
    </div>
  );
};

export default RichTextEditor;