export interface IEditorProps {
  content: string;
  editorRef: { current: any };
  onChange: () => void;
  onClick: () => void;
  config: object;
  key: string;
  className: string;
  onBlur: () => void;
}
