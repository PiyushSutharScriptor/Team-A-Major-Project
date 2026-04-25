require('dotenv').config();
const mongoose = require('mongoose');
const { releaseResource, assignResourceToIssue } = require('./services/resourceService');
const Issue = require('./models/Issue');
const Resource = require('./models/Resource');

const fs = require('fs');
async function runTest() {
  await mongoose.connect(process.env.MONGODB_URI);
  let logs = [];
  
  const activeAssignments = await mongoose.model('Assignment').find({ status: 'active' }).populate('issueId');
  logs.push(`Active assignments: ${activeAssignments.length}`);
  for (const a of activeAssignments) {
    logs.push(`Assignment ${a._id}: Issue ${a.issueId ? a.issueId._id : 'null'} status=${a.issueId ? a.issueId.status : 'null'} Resource ${a.resourceId}`);
  }

  const busyResources = await Resource.find({ currentLoad: { $gt: 0 } });
  logs.push(`Busy resources: ${busyResources.length}`);
  for (const r of busyResources) {
    logs.push(`Resource ${r.teamName}: load=${r.currentLoad}`);
  }

  fs.writeFileSync('logs2.json', JSON.stringify(logs, null, 2));
  mongoose.disconnect();
}

runTest();
