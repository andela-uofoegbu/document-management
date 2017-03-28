import 'babel-polyfill';

import chai from 'chai';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import models from '../../server/models';
import userFixtures from './user-fixtures';
import app from '../../server';

dotenv.config();

const expect = chai.expect;

const JWT_SECRET = process.env.SECRET_KEY;

const adminToken = jwt.sign(userFixtures.existingAdminUser, JWT_SECRET);
const regularToken = jwt.sign(userFixtures.existingRegularUser, JWT_SECRET);


describe('User', () => {
  afterEach((done) => {
    models.User.sync({ force: true })
    .then(() => {
      done();
    });
  });

  it('should create a user', (done) => {
    supertest(app)
    .post('/api/v1/users')
    .send(userFixtures.adminUser)
    .end((err, res) => {
      expect(res.statusCode).to.equal(201);
      done();
    });
  });

  it('should not create duplicate users', (done) => {
    supertest(app)
    .post('/api/v1/users')
    .send(userFixtures.adminUser)
    .end((err, res) => {
      expect(res.statusCode).to.equal(201);
      supertest(app)
        .post('/api/v1/users')
        .send(userFixtures.adminUser)
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          done();
        });
    });
  });

  it('should not create a user missing required field', (done) => {
    supertest(app)
    .post('/api/v1/users')
    .send(userFixtures.incompleteUser)
    .end((err, res) => {
      expect(res.statusCode).to.equal(400);
      done();
    });
  });



  it('should verify that a newly created user has a role defined', (done) => {
    supertest(app)
    .post('/api/v1/users')
    .send(userFixtures.regularUser)
    .end((err, res) => {
      // eslint-disable-next-line no-unused-expressions
      expect(res.body.user.role_id).to.not.be.undefined;
      done();
    });
  });

  it('should verify that a newly created user has first name and last name defined', (done) => {
    supertest(app)
    .post('/api/v1/users')
    .send(userFixtures.regularUser)
    .end((err, res) => {
      // eslint-disable-next-line no-unused-expressions
      expect(res.body.user.first_name).to.not.be.undefined;
      // eslint-disable-next-line no-unused-expressions
      expect(res.body.user.last_name).to.not.be.undefined;
      done();
    });
  });

  it('should verify that only the admin can view all users', (done) => {
    models.User.bulkCreate([userFixtures.existingAdminUser, userFixtures.existingRegularUser])
      .then(() => {
        supertest(app)
          .get('/api/v1/users')
          .set('authorization', `token ${adminToken}`)
          .end((err, res) => {
            expect(res.body).to.have.lengthOf(2);
            done();
          });
      });
  });

  it('should verify that regular users can not view all users', (done) => {
    models.User.bulkCreate([userFixtures.existingAdminUser, userFixtures.existingRegularUser])
      .then(() => {
        supertest(app)
          .get('/api/v1/users')
          .set('authorization', `token ${regularToken}`)
          .end((err, res) => {
            expect(res.statusCode).to.equal(403);
            expect(res.body.error).to.equal('Only an admin can perform this action');
            done();
          });
      });
  });
});
