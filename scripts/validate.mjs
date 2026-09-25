import {loadRaw} from '../src/load.mjs';import {validate,checkPublication} from '../src/domain.mjs';
const data=loadRaw();const errors=validate(data);const blocked=checkPublication(data);
console.log(JSON.stringify({content_errors:errors,stations:data.stations.length,publication_ready:blocked.length===0,publication_blocks:blocked},null,2));
if(errors.length)process.exitCode=1;
