// @ts-nocheck
import { dockStart } from '@nlpjs/basic'
(async () => {
  const dock = await dockStart();
  const nlp = dock.get('nlp');
  const response = await nlp.process('Terima kasih');
  console.log(response);
})();