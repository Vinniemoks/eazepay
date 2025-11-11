import { RedocStandalone } from 'redoc';

const ApiReferencePage = () => {
  return (
    <div>
      <RedocStandalone
        specUrl="/openapi.yaml"
        options={{
          theme: { colors: { primary: { main: '#2563eb' } } },
          nativeScrollbars: true,
        }}
      />
    </div>
  );
};

export default ApiReferencePage;