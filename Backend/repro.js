const mongoose = require('mongoose');
const { createIssue } = require('./controllers/issueController');
const { updateIssueStatus } = require('./controllers/issueController');
const { releaseResource } = require('./services/resourceService');
const Issue = require('./models/Issue');
const Resource = require('./models/Resource');
const Assignment = require('./models/Assignment');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  // get a user
  const User = require('./models/User');
  const user = await User.findOne();
  if(!user) return console.log('no user');

  // get a resource
  const res1 = await Resource.findOne();
  if(!res1) return console.log('no resource');
  console.log(`Resource ${res1.teamName} initial load: ${res1.currentLoad}`);

  // Create issue
  let issue = await Issue.create({
    userId: user._id,
    issueType: 'water_leakage',
    severity: 'high',
    description: 'test leak',
    location: { type: 'Point', coordinates: [0,0] },
    zone: res1.zone
  });
  console.log(`Created issue: ${issue._id}`);

  // Auto assign
  const { assignResourceToIssue } = require('./services/resourceService');
  await assignResourceToIssue(issue);
  
  const resAfterAssign = await Resource.findById(res1._id);
  console.log(`Resource load after assign: ${resAfterAssign.currentLoad}`);

  // Resolve via updateIssueStatus
  // Mock req, res
  const req = {
    body: { status: 'resolved' },
    params: { id: issue._id.toString() }
  };
  const res = {
    json: (data) => console.log('Res JSON:', data),
    status: (code) => ({ json: (data) => console.log(`Res Status ${code}:`, data) })
  };

  await updateIssueStatus(req, res, console.error);

  const resAfterResolve = await Resource.findById(res1._id);
  console.log(`Resource load after resolve: ${resAfterResolve.currentLoad}`);

  mongoose.disconnect();
}
run();
